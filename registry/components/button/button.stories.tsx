import * as stylex from "@stylexjs/stylex";
import { type ComponentProps, useRef, useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import preview from "@/.storybook/preview";
import { applyTheme } from "../../foundations/themes";
import { radius } from "../../foundations/tokens.stylex";
import { PlusIcon } from "../icons/icons";
import { Button, type ButtonSize, type ButtonVariant } from "./button";

const VARIANTS: ButtonVariant[] = [
  "default",
  "outline",
  "secondary",
  "ghost",
  "destructive",
  "link",
];

const SIZES: ButtonSize[] = ["xs", "sm", "default", "lg", "icon-xs", "icon-sm", "icon", "icon-lg"];
const ICON_SIZES: ButtonSize[] = ["icon-xs", "icon-sm", "icon", "icon-lg"];
const SIZE_LABELS: Record<ButtonSize, string> = {
  xs: "Extra Small",
  sm: "Small",
  default: "Default",
  lg: "Large",
  "icon-xs": "Icon Extra Small",
  "icon-sm": "Icon Small",
  icon: "Icon",
  "icon-lg": "Icon Large",
};

const meta = preview.meta({
  title: "Components/Button",
  component: Button,
  args: {
    children: "Button",
    onClick: fn(),
  },
  argTypes: {
    variant: { control: "select", options: VARIANTS },
    size: { control: { type: "select", labels: SIZE_LABELS }, options: SIZES },
    disabled: { control: "boolean" },
  },
  parameters: {
    figma: {
      states: ["hover", "focus-visible"],
      omit: { size: ICON_SIZES },
      instances: { Icon: <PlusIcon /> },
    },
  },
});

export const Default = meta.story({
  play: async ({ args, canvas }) => {
    const button = canvas.getByRole("button", { name: "Button" });

    await expect(button).toHaveAttribute("type", "button");
    await expect(button).toHaveAttribute("data-slot", "button");
    await expect(getComputedStyle(button).backgroundColor).toBe("rgb(23, 23, 23)");
    await expect(getComputedStyle(button).color).toBe("rgb(255, 255, 255)");

    await userEvent.click(button);

    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
});

export const Outline = meta.story({
  args: { variant: "outline" },
  play: async ({ canvas }) => {
    const style = getComputedStyle(canvas.getByRole("button"));

    await expect(style.borderTopColor).toBe("rgb(234, 234, 234)");
    await expect(style.backgroundColor).toBe("rgba(0, 0, 0, 0)");
  },
});

export const Secondary = meta.story({
  args: { variant: "secondary" },
});

export const Ghost = meta.story({
  args: { variant: "ghost" },
  play: async ({ canvas }) => {
    const style = getComputedStyle(canvas.getByRole("button"));

    await expect(style.backgroundColor).toBe("rgba(0, 0, 0, 0)");
  },
});

export const Destructive = meta.story({
  args: { variant: "destructive", children: "Delete" },
  play: async ({ canvas }) => {
    const style = getComputedStyle(canvas.getByRole("button"));

    await expect(style.backgroundColor).toBe("oklch(0.53 0.22 27.3)");
    await expect(style.color).toBe("rgb(255, 255, 255)");
  },
});

export const Link = meta.story({
  args: { variant: "link" },
});

export const Sizes = meta.story({
  render: (args) => (
    <>
      <Button {...args} size="xs">
        Extra small
      </Button>
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="default">
        Default
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </>
  ),
  play: async ({ canvas }) => {
    const heights = ["Extra small", "Small", "Default", "Large"].map(
      (name) => canvas.getByRole("button", { name }).getBoundingClientRect().height,
    );

    await expect(heights).toEqual([24, 28, 32, 36]);
  },
});

/** Icon-only buttons are square and need an accessible name. */
export const IconSizes = meta.story({
  render: (args) => (
    <>
      {ICON_SIZES.map((size) => (
        <Button {...args} key={size} size={size} variant="outline" aria-label={`Add (${size})`}>
          <PlusIcon />
        </Button>
      ))}
    </>
  ),
  play: async ({ canvas }) => {
    const boxes = canvas
      .getAllByRole("button")
      .map((button) => button.getBoundingClientRect())
      .map(({ width, height }) => [width, height]);

    await expect(boxes).toEqual([
      [24, 24],
      [28, 28],
      [32, 32],
      [36, 36],
    ]);

    const glyphs = canvas
      .getAllByRole("button")
      .map((button) => button.querySelector("svg")!.getBoundingClientRect().width);

    await expect(glyphs).toEqual([12, 16, 16, 16]);
  },
});

/** Icons are `1em`, so they follow the label's font size without any icon props. */
export const WithIcon = meta.story({
  render: (args) => (
    <>
      <Button {...args} size="sm">
        <PlusIcon /> Small
      </Button>
      <Button {...args}>
        <PlusIcon /> Add item
      </Button>
    </>
  ),
  play: async ({ canvas }) => {
    const [small, regular] = canvas.getAllByRole("button");

    await expect(small!.querySelector("svg")!.getBoundingClientRect().width).toBeCloseTo(12.8);
    await expect(regular!.querySelector("svg")!.getBoundingClientRect().width).toBe(14);
    await expect(regular!.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  },
});

export const Disabled = meta.story({
  render: (args) => (
    <>
      {VARIANTS.map((variant) => (
        <Button {...args} key={variant} variant={variant} disabled>
          {variant}
        </Button>
      ))}
    </>
  ),
  play: async ({ args, canvas }) => {
    for (const button of canvas.getAllByRole("button")) {
      await expect(button).toBeDisabled();
      await expect(getComputedStyle(button).opacity).toBe("0.5");
      await userEvent.click(button, { pointerEventsCheck: 0 });
    }

    await expect(args.onClick).not.toHaveBeenCalled();

    await userEvent.tab();

    await expect(document.body).toHaveFocus();
  },
});

/** For loading states: the button keeps focus while it ignores interaction. */
export const FocusableWhenDisabled = meta.story({
  args: { disabled: true, focusableWhenDisabled: true, children: "Saving" },
  play: async ({ args, canvas }) => {
    const button = canvas.getByRole("button", { name: "Saving" });

    await userEvent.tab();

    await expect(button).toHaveFocus();
    await expect(button).toHaveAttribute("aria-disabled", "true");

    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    await userEvent.click(button, { pointerEventsCheck: 0 });

    await expect(args.onClick).not.toHaveBeenCalled();
  },
});

export const Keyboard = meta.story({
  play: async ({ args, canvas }) => {
    const button = canvas.getByRole("button", { name: "Button" });

    await userEvent.tab();

    await expect(button).toHaveFocus();

    // Colors transition, so let the focus styles settle before asserting them.
    await waitFor(() => {
      if (button.getAnimations().length > 0) throw new Error("focus transition still running");
    });
    const focused = getComputedStyle(button);

    await expect(focused.borderTopColor).toBe("rgb(143, 143, 143)");
    await expect(focused.boxShadow).toMatch(/ 0px 0px 0px 3px$/);
    await expect(focused.outlineStyle).toBe("solid");

    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");

    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
});

/** `aria-invalid` and `aria-expanded` are styled, for form and popup triggers. */
export const AriaStates = meta.story({
  render: (args) => (
    <>
      <Button {...args} variant="outline" aria-invalid>
        Invalid
      </Button>
      <Button {...args} variant="ghost" aria-expanded>
        Expanded
      </Button>
    </>
  ),
  play: async ({ canvas }) => {
    const invalid = getComputedStyle(canvas.getByRole("button", { name: "Invalid" }));
    const expanded = getComputedStyle(canvas.getByRole("button", { name: "Expanded" }));

    await expect(invalid.borderTopColor).toBe("oklch(0.577 0.245 27.3)");
    await expect(invalid.boxShadow).toContain("0px 0px 0px 3px");
    await expect(expanded.backgroundColor).toBe("rgb(235, 235, 235)");
  },
});

const formSubmitted = fn();

/** Button defaults to `type="button"`, so it never submits a form by accident. */
export const InsideForm = meta.story({
  render: (args) => (
    <form
      aria-label="Project"
      onSubmit={(event) => {
        event.preventDefault();
        formSubmitted();
      }}
    >
      <Button {...args} variant="outline">
        Preview
      </Button>
      <Button {...args} type="submit">
        Save
      </Button>
    </form>
  ),
  play: async ({ canvas }) => {
    formSubmitted.mockClear();

    await userEvent.click(canvas.getByRole("button", { name: "Preview" }));

    await expect(formSubmitted).not.toHaveBeenCalled();

    await userEvent.click(canvas.getByRole("button", { name: "Save" }));

    await expect(formSubmitted).toHaveBeenCalledTimes(1);
  },
});

/** Rendering a non-button element keeps button semantics and keyboard behavior. */
export const RenderAsDiv = meta.story({
  args: { render: <div />, nativeButton: false, children: "Custom element" },
  play: async ({ args, canvas }) => {
    const button = canvas.getByRole("button", { name: "Custom element" });

    await expect(button.tagName).toBe("DIV");

    await userEvent.tab();

    await expect(button).toHaveFocus();

    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");

    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
});

function RefProbe(props: ComponentProps<typeof Button>) {
  const ref = useRef<HTMLButtonElement>(null);
  const [tag, setTag] = useState("none");

  return (
    <>
      <Button {...props} ref={ref} onClick={() => setTag(ref.current?.tagName ?? "null")}>
        Read ref
      </Button>
      <output aria-label="Ref target">{tag}</output>
    </>
  );
}

export const ForwardsRef = meta.story({
  render: (args) => <RefProbe {...args} />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Read ref" }));

    await expect(canvas.getByLabelText("Ref target")).toHaveTextContent("BUTTON");
  },
});

const overrides = stylex.create({
  pill: { borderRadius: radius.full },
});

/** Local styling goes through the StyleX `style` prop, applied after Shelf styles. */
export const StyleOverride = meta.story({
  args: { style: overrides.pill, children: "Pill" },
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: "Pill" });

    await expect(getComputedStyle(button).borderTopLeftRadius).toBe("9999px");
  },
});

export const Dark = meta.story({
  parameters: { themes: { themeOverride: "dark" } },
  render: (args) => (
    <>
      {VARIANTS.map((variant) => (
        <Button {...args} key={variant} variant={variant}>
          {variant}
        </Button>
      ))}
      <Button {...args} disabled>
        disabled
      </Button>
    </>
  ),
  play: async ({ canvasElement }) => {
    const button = (name: string) => within(canvasElement).getByRole("button", { name });

    await expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    await expect(getComputedStyle(button("default")).backgroundColor).toBe("rgb(237, 237, 237)");
    await expect(getComputedStyle(button("default")).color).toBe("rgb(10, 10, 10)");
    await expect(getComputedStyle(button("outline")).borderTopColor).toBe("rgb(38, 38, 38)");
  },
});

async function frames(count: number) {
  for (let i = 0; i < count; i++) await new Promise(requestAnimationFrame);
}

function ThemeToggle(props: ComponentProps<typeof Button>) {
  const root = useRef<HTMLDivElement>(null);

  const toggle = () => {
    if (!root.current) return;
    applyTheme(root.current.dataset["theme"] === "dark" ? "light" : "dark", root.current);
  };

  return (
    <div ref={root} data-testid="themed" data-theme="light">
      <Button {...props} onClick={toggle}>
        Toggle theme
      </Button>
    </div>
  );
}

/** Switching themes is instant: colors don't transition. */
export const ThemeSwitch = meta.story({
  render: (args) => <ThemeToggle {...args} />,
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: "Toggle theme" });
    const root = canvas.getByTestId("themed");

    // A programmatic click avoids hover and focus transitions.
    for (const [theme, background] of [
      ["dark", "rgb(237, 237, 237)"],
      ["light", "rgb(23, 23, 23)"],
    ]) {
      button.click();

      await waitFor(() => {
        if (root.dataset["theme"] !== theme) throw new Error(`theme is not ${theme} yet`);
      });
      await frames(3);

      await expect(button.getAnimations()).toHaveLength(0);
      await expect(getComputedStyle(button).backgroundColor).toBe(background);
    }
  },
});
