import {
  type ComponentType,
  type ReactElement,
  type ReactNode,
  Fragment,
  createElement,
  isValidElement,
  useLayoutEffect,
  useRef,
} from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { type ComponentSet, IR_VERSION, type Icon, type Library, variantName } from "../ir";
import { nestInstances } from "./instances";
import { STATES, type State, forcePseudoStates } from "./pseudo";
import { type Tokens, indexTokens } from "./tokens";
import { CaptureError, type WalkContext, iconKey, walk } from "./walk";

/**
 * `parameters.figma` on a stories meta puts the component in the Figma library; `{}` is enough.
 * These options cover only what the stories and argTypes can't express.
 *
 * Overlays that open from a control, such as Select, Combobox, Autocomplete, Command, Menubar
 * and Date Picker, are captured as their closed control: that's what a designer places, and an
 * open popup is drawn with Popover or Dropdown Menu. Overlays that are only their content, such
 * as Dialog, Popover and Toast, set `story: "Open"` and `root` to the content's `data-slot`.
 */
export interface FigmaParameters {
  /** The story that renders the component: `Default` unless set, else the first story. */
  story?: string;
  /** The `data-slot` to capture when the story renders more, such as an overlay's content. */
  root?: string;
  /** Measure at the canvas width, like a page, instead of at the component's natural width. */
  fill?: boolean;
  /** Interactive states to add to the State axis. */
  states?: State[];
  /** Options to leave out, per arg, such as icon-only sizes. */
  omit?: Record<string, readonly string[]>;
  /** Named instance swaps, rendered before `children` and hidden by default. */
  instances?: Record<string, ReactElement>;
}

interface ArgType {
  name?: string;
  control?: string | { type?: string; labels?: Record<string, string> };
  options?: readonly unknown[];
}

interface Context {
  args: Record<string, unknown>;
}
type Render = (args: Record<string, unknown>, context: Context) => ReactNode;
type Decorator = (story: ComponentType, context: Context) => ReactNode;

/** The parts of a CSF story that capture reads. */
export interface StoryInput {
  args?: Record<string, unknown>;
  render?: Render;
  decorators?: Decorator | Decorator[];
}

/** The parts of a CSF meta that capture reads. */
export interface MetaInput extends StoryInput {
  title?: string;
  component?: ComponentType<Record<string, unknown>>;
  argTypes?: Record<string, ArgType>;
  parameters: { figma: FigmaParameters };
}

export interface FigmaEntry {
  meta: MetaInput;
  /** The file's stories, by export name. */
  stories: Record<string, StoryInput>;
  /** The story file, relative to the repository, such as `registry/components/button/button.stories.tsx`. */
  source: string;
}

interface Axis {
  name: string;
  arg: string;
  values: Array<{ value: unknown; label: string }>;
}

interface Combo {
  props: Record<string, string>;
  args: Record<string, unknown>;
  state?: State;
}

interface Planned {
  entry: FigmaEntry;
  name: string;
  render?: Render;
  /** Innermost first, as Storybook applies them. */
  decorators: Decorator[];
  combos: Combo[];
  label?: string;
  instances: Record<string, ReactElement>;
}

declare global {
  interface Window {
    /** Set while the Figma library story is mounted; the Shelf plugin UI calls it. */
    shelfFigma?: { capture: () => Promise<Library> };
  }
}

/**
 * Every component with `parameters.figma`, expanded from its meta's argTypes into one variant per
 * combination, plus the icon catalog. Capture mounts each variant's story on this page in turn.
 */
export function FigmaLibrary({
  entries,
  icons,
  tokens,
  darkClassName,
}: {
  entries: FigmaEntry[];
  icons: Record<string, ComponentType>;
  tokens: Tokens;
  darkClassName: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const iconList = Object.entries(icons)
    .filter(([name]) => name.endsWith("Icon"))
    .map(([name, component]) => ({ name: `Icon/${name.slice(0, -"Icon".length)}`, component }));

  useLayoutEffect(() => {
    // One capture at a time: they share the stage.
    let running: Promise<Library> | undefined;
    window.shelfFigma = {
      capture: () =>
        (running ??= capture(ref.current!, entries.map(plan), tokens, darkClassName).finally(() => {
          running = undefined;
        })),
    };
    return () => {
      delete window.shelfFigma;
    };
  });

  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: 32, width: "100%" }}>
      <section data-figma-icons="" style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {iconList.map(({ name, component }) => (
          <span key={name} data-figma-icon={name} title={name} style={{ display: "flex" }}>
            {createElement(component)}
          </span>
        ))}
      </section>
      <div
        data-figma-stage=""
        style={{ display: "flex", alignItems: "flex-start", maxWidth: "100%" }}
      />
    </div>
  );
}

/** The story as Storybook renders it, without the preview's decorators. */
function StoryRender({ set, args }: { set: Planned; args: Record<string, unknown> }) {
  const context = { args };
  const story = (
    <div data-figma-story="" style={{ display: "contents" }}>
      {set.render ? set.render(args, context) : componentStory(set, args)}
    </div>
  );
  return set.decorators.reduce<ReactNode>((inner, decorator) => {
    const Story = () => inner;
    return decorator(Story, context);
  }, story);
}

function componentStory(set: Planned, args: Record<string, unknown>): ReactNode {
  const component = set.entry.meta.component;
  if (!component) throw new CaptureError(`${set.name}: the story has no render or component.`);
  const extras = Object.entries(set.instances);
  if (extras.length === 0) return createElement(component, args);
  return createElement(
    component,
    args,
    ...extras.map(([name, instance]) => <Fragment key={name}>{instance}</Fragment>),
    asNode(args["children"]),
  );
}

function asNode(value: unknown): ReactNode {
  if (value == null || typeof value === "string" || typeof value === "number") return value;
  if (isValidElement(value)) return value;
  throw new CaptureError(`children must be text or an element to render with instances.`);
}

/** Select, radio and boolean argTypes become variant axes; `disabled` joins State. */
function plan(entry: FigmaEntry): Planned {
  const { meta, stories } = entry;
  const figma = meta.parameters.figma;
  const name = meta.title?.split("/").pop() ?? "Component";
  const storyName = figma.story ?? ("Default" in stories ? "Default" : Object.keys(stories)[0]);
  const story = (storyName && stories[storyName]) || {};
  if (figma.story && !(figma.story in stories)) {
    throw new CaptureError(`${name}: parameters.figma.story "${figma.story}" isn't a story.`);
  }
  const axes: Axis[] = [];
  for (const [arg, argType] of Object.entries(meta.argTypes ?? {})) {
    const control = typeof argType.control === "string" ? argType.control : argType.control?.type;
    const labels = typeof argType.control === "object" ? argType.control.labels : undefined;
    const omit = new Set(figma.omit?.[arg] ?? []);
    const options =
      control === "boolean" && arg !== "disabled"
        ? [false, true]
        : control && ["select", "radio", "inline-radio"].includes(control)
          ? (argType.options ?? [])
          : [];
    if (options.length === 0) continue;
    axes.push({
      name: argType.name ?? title(arg),
      arg,
      values: options
        .filter((value) => !omit.has(String(value)))
        .map((value) => ({ value, label: labels?.[String(value)] ?? title(String(value)) })),
    });
  }
  const states: Array<{ label: string; state?: State; disabled?: boolean }> = [
    { label: "Default" },
    ...(figma.states ?? []).map((state) => ({ label: STATES[state].name, state })),
    ...("disabled" in (meta.argTypes ?? {}) ? [{ label: "Disabled", disabled: true }] : []),
  ];

  const args = { ...meta.args, ...story.args };
  let combos: Combo[] = [{ props: {}, args }];
  for (const axis of axes) {
    combos = combos.flatMap((combo) =>
      axis.values.map(({ value, label }) => ({
        props: { ...combo.props, [axis.name]: label },
        args: { ...combo.args, [axis.arg]: value },
      })),
    );
  }
  if (states.length > 1) {
    combos = combos.flatMap((combo) =>
      states.map(({ label, state, disabled }) => ({
        props: { ...combo.props, State: label },
        args: disabled ? { ...combo.args, disabled: true } : combo.args,
        ...(state && { state }),
      })),
    );
  }
  const render = story.render ?? meta.render;
  const label = !render && typeof args["children"] === "string" ? args["children"] : undefined;
  return {
    entry,
    name,
    combos,
    decorators: [story.decorators ?? [], meta.decorators ?? []].flat(),
    instances: figma.instances ?? {},
    ...(render && { render }),
    ...(label && { label }),
  };
}

async function capture(
  host: HTMLElement,
  planned: Planned[],
  tokens: Tokens,
  darkClassName: string,
): Promise<Library> {
  const settle = document.createElement("style");
  settle.textContent = "*,*::before,*::after{transition:none!important;animation:none!important}";
  document.head.append(settle);
  try {
    await document.fonts.ready;
    await frames();

    const index = indexTokens(tokens, darkClassName);
    const icons: Icon[] = [];
    const iconNames = new Map<string, string>();
    for (const span of host.querySelectorAll<HTMLElement>("[data-figma-icon]")) {
      const svg = span.querySelector("svg");
      if (!svg) continue;
      const name = span.dataset["figmaIcon"]!;
      iconNames.set(iconKey(svg), name);
      icons.push({ name, svg: normalizeSvg(svg) });
    }

    const stage = host.querySelector<HTMLElement>("[data-figma-stage]")!;
    const components: ComponentSet[] = [];
    const errors: string[] = [];
    for (const set of planned) {
      try {
        stage.style.width = set.entry.meta.parameters.figma.fill ? "100%" : "fit-content";
        components.push(await captureSet(stage, set, { index, icons: iconNames }));
      } catch (error) {
        if (!(error instanceof CaptureError)) throw error;
        errors.push(error.message);
      }
    }
    if (errors.length > 0) throw new CaptureError(errors.join("\n"));
    nestInstances(components);
    return { version: IR_VERSION, foundations: index.foundations, icons, components };
  } finally {
    settle.remove();
  }
}

async function captureSet(
  stage: HTMLElement,
  set: Planned,
  base: Pick<WalkContext, "index" | "icons">,
): Promise<ComponentSet> {
  const instances: Record<string, string> = {};
  const instanceProperties = new Map<string, string>();
  for (const [property, instance] of Object.entries(set.instances)) {
    const svg = await mounted(stage, instance, () => stage.querySelector("svg"));
    const component = svg ? base.icons.get(iconKey(svg)) : undefined;
    if (!component) {
      throw new CaptureError(
        `${set.name}: instance ${property} isn't an icon from the icons item.`,
      );
    }
    instances[property] = component;
    instanceProperties.set(component, property);
  }
  const text: Record<string, string> = set.label ? { Label: set.label } : {};
  const context: WalkContext = {
    ...base,
    textProperties: new Map(set.label ? [[set.label, "Label"]] : []),
    instanceProperties,
  };
  const variants = [];
  for (const combo of set.combos) {
    const path = [set.name, variantName(combo.props)].filter(Boolean).join("/");
    const node = await mounted(stage, <StoryRender set={set} args={combo.args} />, async () => {
      const slot = set.entry.meta.parameters.figma.root;
      let root = find(stage, slot);
      // Popups and toasts can mount a few frames after the story.
      for (let i = 0; !root && i < 30; i++) {
        await frames();
        root = find(stage, slot);
      }
      if (!root) {
        throw new CaptureError(
          `${path}: rendered nothing to capture${slot ? ` with data-slot="${slot}"` : ""}.`,
        );
      }
      if (combo.state) {
        root.classList.add(STATES[combo.state].className);
        forcePseudoStates();
      }
      return walk(root, path, context);
    });
    variants.push({ props: combo.props, node });
  }
  return { name: set.name, source: set.entry.source, text, instances, variants };
}

/** Renders into the stage, lets effects and popups settle, reads, then unmounts. */
async function mounted<T>(
  stage: HTMLElement,
  node: ReactNode,
  read: () => T | Promise<T>,
): Promise<T> {
  const root = createRoot(stage);
  try {
    flushSync(() => root.render(node));
    await frames();
    return await read();
  } finally {
    root.unmount();
  }
}

/** What the story renders inside its decorators, or the element with the slot, which may be portaled. */
function find(stage: HTMLElement, slot: string | undefined): Element | null {
  if (!slot) return stage.querySelector("[data-figma-story]")?.firstElementChild ?? null;
  const selector = `[data-slot="${CSS.escape(slot)}"]`;
  return stage.querySelector(selector) ?? [...document.querySelectorAll(selector)].pop() ?? null;
}

function frames(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

/** Markup Figma's SVG import reads: explicit size, and `currentColor` made black to be tinted. */
function normalizeSvg(svg: SVGElement): string {
  const clone = svg.cloneNode(true);
  if (!(clone instanceof SVGElement)) throw new CaptureError("Icon clone isn't an SVG.");
  const viewBox = clone.getAttribute("viewBox") ?? "0 0 24 24";
  const [, , width, height] = viewBox.split(/\s+/);
  for (const attribute of ["class", "aria-hidden", "style"]) clone.removeAttribute(attribute);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", width ?? "24");
  clone.setAttribute("height", height ?? "24");
  return clone.outerHTML.replaceAll("currentColor", "#000000");
}

function title(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
