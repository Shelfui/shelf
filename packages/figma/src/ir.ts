/**
 * The contract between capture (in Storybook) and the Figma plugin. Capture writes it,
 * the plugin applies it. Bump IR_VERSION on any change the plugin must understand.
 */
export const IR_VERSION = 2;

/** sRGB, 0–1. */
export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

/** A variable reference, such as `colors.primary` or `spacing.2.5`. */
export type Token = string;

export interface Paint {
  color: Rgba;
  /** Bound to this color variable, with `color.a` as the paint opacity. */
  token?: Token;
}

export interface Length {
  value: number;
  token?: Token;
}

export type Sizing = "fixed" | "hug" | "fill";

export interface Shadow {
  x: number;
  y: number;
  blur: number;
  spread: number;
  paint: Paint;
}

/** A grid track: pixels, a share of the free space like `fr`, or the size of its content. */
export interface Track {
  type: "fixed" | "flex" | "hug";
  value: number;
}

export interface Placement {
  /**
   * Taken out of Auto Layout at this offset from the parent's top left, like CSS
   * `position: absolute`.
   */
  position?: { x: number; y: number };
  /** Its cell in a grid parent, zero-based. */
  cell?: { row: number; column: number; rowSpan: number; columnSpan: number };
}

export interface Sides {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface FrameNode extends Placement {
  type: "frame";
  name: string;
  width: Length;
  height: Length;
  sizing: { horizontal: Sizing; vertical: Sizing };
  layout?: {
    direction: "row" | "column" | "grid";
    gap: Length;
    padding: { top: Length; right: Length; bottom: Length; left: Length };
    align: "start" | "center" | "end" | "baseline";
    justify: "start" | "center" | "end" | "space-between";
    wrap: boolean;
    /** Tracks and the gap between rows, for `grid`; `gap` is between columns. */
    grid?: { columns: Track[]; rows: Track[]; rowGap: Length };
  };
  fill?: Paint;
  /**
   * Counted in layout, like a CSS border. No paint means transparent. `sides` when the widths
   * differ, such as a bottom border; `dash` for a dashed border.
   */
  stroke?: { paint?: Paint; weight: number; sides?: Sides; dash?: number[] };
  radius?: Length;
  /** Top left, top right, bottom right, bottom left, when they differ. */
  corners?: [Length, Length, Length, Length];
  opacity?: number;
  shadows?: Shadow[];
  clip?: boolean;
  children: Node[];
}

/** Characters styled apart from the rest of their text, such as a link or inline code. */
export interface TextRange {
  start: number;
  end: number;
  fill?: Paint;
  fontFamily?: string;
  fontWeight?: Length;
  fontSize?: Length;
  underline?: boolean;
}

export interface TextNode extends Placement {
  type: "text";
  name: string;
  characters: string;
  fill: Paint;
  fontFamily: string;
  fontWeight: Length;
  fontSize: Length;
  lineHeight: Length;
  letterSpacing: number;
  underline: boolean;
  align?: "center" | "right";
  ranges?: TextRange[];
  /** Name of the text style whose tokens this text uses, such as `Sm/Medium`. */
  textStyle?: string;
  sizing: { horizontal: Sizing; vertical: Sizing };
  width: number;
  /** The component TEXT property it exposes, such as `Label`. */
  property?: string;
}

/** An instance of a component in the same document: an icon, or a Shelf component such as Button. */
export interface InstanceNode extends Placement {
  type: "instance";
  name: string;
  /** Icon or component set name, such as `Icon/Plus` or `Button`. */
  component: string;
  /** The variant, for a component set. */
  variant?: Record<string, string>;
  /** Changes from the variant: text by position, and instance swap properties. */
  overrides?: {
    characters?: Array<string | null>;
    show?: Record<string, boolean>;
    swap?: Record<string, string>;
  };
  /** How it sizes in its parent, for a component; icons keep their size. */
  sizing?: { horizontal: Sizing; vertical: Sizing };
  width: number;
  height: number;
  /** Degrees counterclockwise, as Figma measures them. */
  rotation?: number;
  /** Tints every vector in the instance, as `currentColor` does. */
  color?: Paint;
  /** The component INSTANCE_SWAP property it exposes, such as `Icon`. */
  property?: string;
}

/** Artwork that isn't an icon, such as a chart: SVG markup with its colors resolved. */
export interface VectorNode extends Placement {
  type: "vector";
  name: string;
  svg: string;
  width: number;
  height: number;
}

export type Node = FrameNode | TextNode | InstanceNode | VectorNode;

export interface Variant {
  /** Figma variant properties, such as `{ Variant: "Outline", Size: "Small", State: "Hover" }`. */
  props: Record<string, string>;
  node: FrameNode;
}

export interface ComponentSet {
  /** Figma name, such as `Button`. */
  name: string;
  /** The story file it came from, which the site maps to a registry item. */
  source: string;
  /** The registry item's description, added by the site. */
  description?: string;
  variants: Variant[];
  /** Text properties and their default values. */
  text: Record<string, string>;
  /** Instance swap properties and their default component names. */
  instances: Record<string, string>;
  /** Item name and revision, added by the site from the registry index. */
  item?: { name: string; revision: string; docs: string; install: string };
}

export interface Icon {
  /** Figma name, such as `Icon/Plus`. */
  name: string;
  /** Normalized markup: `viewBox` and child elements, stroke `currentColor`. */
  svg: string;
}

export type VariableType = "COLOR" | "FLOAT" | "STRING";

/** The Figma `VariableScope`s Shelf uses: where a variable is offered. */
export type VariableScope =
  | "ALL_FILLS"
  | "STROKE_COLOR"
  | "EFFECT_COLOR"
  | "GAP"
  | "CORNER_RADIUS"
  | "WIDTH_HEIGHT"
  | "FONT_FAMILY"
  | "FONT_SIZE"
  | "LINE_HEIGHT"
  | "FONT_WEIGHT";

export interface Variable {
  /** Figma name, such as `primary` or `2.5`. */
  name: string;
  /** Code syntax and reference, such as `colors.primary`. */
  token: Token;
  type: VariableType;
  scopes: VariableScope[];
  /** One value per collection mode. */
  values: Record<string, Rgba | number | string>;
  description?: string;
}

export interface Collection {
  name: string;
  modes: string[];
  variables: Variable[];
}

export interface TextStyle {
  /** Figma name, such as `Sm/Medium`. */
  name: string;
  fontFamily: Token;
  fontSize: Token;
  lineHeight: Token;
  fontWeight: Token;
}

export interface EffectStyle {
  /** Figma name, such as `Elevation/Sm`. */
  name: string;
  token: Token;
  shadows: Shadow[];
}

export interface Foundations {
  collections: Collection[];
  textStyles: TextStyle[];
  effectStyles: EffectStyle[];
}

export interface Library {
  version: typeof IR_VERSION;
  foundations: Foundations;
  icons: Icon[];
  components: ComponentSet[];
  /** Item name → revision for everything in this library, added by the site. */
  revisions?: Record<string, string>;
}

/** Figma's variant name: `Variant=Outline, Size=Small`. */
export function variantName(props: Record<string, string>): string {
  return Object.entries(props)
    .map(([key, value]) => `${key}=${value}`)
    .join(", ");
}
