import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { contrast, toHex } from "../../../../packages/figma/src/capture/color";
import { CopyButton } from "@/components/site/command";
import { PageHeader } from "@/components/site/page-header";
import { layout, text } from "@/components/site/styles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import * as T from "@/components/ui/typography";
import { useAsync, useRegistry } from "@/data";
import { type Library, type Rgba, captureLibrary, forRegistry, hasFigmaLibrary } from "@/figma";
import { NotFound } from "@/views/not-found";
import { colors, radius, spacing, typography } from "@/styles/shelf/tokens.stylex";

type Collections = Library["foundations"]["collections"];

/**
 * The registry's foundations as its Storybook renders them: the same capture the Figma
 * plugin syncs, so what is shown here is what designers get as variables and styles.
 */
export function Foundations() {
  const registry = useRegistry();
  const [attempt, setAttempt] = useState(0);
  const capture = useAsync(
    () => captureLibrary().then((library) => forRegistry(library, registry)),
    `foundations:${attempt}`,
  );
  if (!hasFigmaLibrary(registry)) {
    return (
      <NotFound title="No foundations capture">
        This registry was built without a Storybook. Build it with: shelf build registry --storybook
        storybook-static
      </NotFound>
    );
  }
  const library = capture.value;
  const collections = library?.foundations.collections ?? [];
  return (
    <div {...stylex.props(layout.stack)}>
      <PageHeader
        title="Foundations"
        lead="Colors, type, spacing, radius, and elevation, with their token names. Figma gets the same values as variables and styles."
      />
      {capture.error && (
        <div {...stylex.props(layout.section)}>
          <T.Muted>{capture.error.message}</T.Muted>
          <div>
            <Button variant="outline" onClick={() => setAttempt(attempt + 1)}>
              Try again
            </Button>
          </div>
        </div>
      )}
      {!library && !capture.error && <Skeleton style={styles.skeleton} />}
      {library && (
        <>
          <Colors collections={collections} />
          <Typography library={library} />
          <Scale collections={collections} name="Spacing" />
          <Scale collections={collections} name="Radius" />
          <Elevation library={library} />
        </>
      )}
    </div>
  );
}

function Colors({ collections }: { collections: Collections }) {
  const collection = collections.find((entry) => entry.name === "Color");
  if (!collection) return null;
  const byName = new Map(collection.variables.map((variable) => [variable.name, variable]));
  return (
    <section {...stylex.props(layout.section)}>
      <T.H3>Color</T.H3>
      <T.Muted>
        Contrast is between a color and its Foreground pair. AA needs 4.5:1 for body text.
      </T.Muted>
      <div {...stylex.props(styles.colorGrid)}>
        {collection.variables.map((variable) => {
          const pair = byName.get(
            variable.name === "background" ? "foreground" : `${variable.name}Foreground`,
          );
          return (
            <div key={variable.token} {...stylex.props(styles.colorCard)}>
              <div {...stylex.props(styles.swatches)}>
                {collection.modes.map((mode) => {
                  const color = asRgba(variable.values[mode]);
                  const on = asRgba(pair?.values[mode]);
                  const ink = on ?? (color && readable(color));
                  return (
                    <div
                      key={mode}
                      title={`${mode}: ${color ? hex(color) : "?"}`}
                      {...stylex.props(
                        styles.swatch,
                        color && styles.fill(css(color)),
                        ink && styles.ink(css(ink)),
                      )}
                    >
                      <span {...stylex.props(styles.mode)}>{mode}</span>
                      {color && on && <span>{contrast(color, on).toFixed(1)}</span>}
                    </div>
                  );
                })}
              </div>
              <div {...stylex.props(styles.colorMeta)}>
                <span {...stylex.props(styles.colorName)}>
                  {variable.name}
                  <CopyButton value={variable.token} label={`Copy ${variable.token}`} />
                </span>
                <code {...stylex.props(text.mono, styles.values)}>
                  {collection.modes
                    .map((mode) => {
                      const color = asRgba(variable.values[mode]);
                      return color ? hex(color) : "";
                    })
                    .join(" / ")}
                </code>
                {pair && <PairBadge variable={variable} pair={pair} modes={collection.modes} />}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PairBadge({
  variable,
  pair,
  modes,
}: {
  variable: Collections[number]["variables"][number];
  pair: Collections[number]["variables"][number];
  modes: string[];
}) {
  const ratios = modes.flatMap((mode) => {
    const a = asRgba(variable.values[mode]);
    const b = asRgba(pair.values[mode]);
    return a && b ? [contrast(a, b)] : [];
  });
  const lowest = Math.min(...ratios);
  return (
    <span>
      <Badge variant={lowest >= 4.5 ? "secondary" : "destructive"}>
        {lowest >= 4.5 ? "AA" : "Below AA"} {lowest.toFixed(1)}:1
      </Badge>
    </span>
  );
}

function Typography({ library }: { library: Library }) {
  const values = tokenValues(library.foundations.collections);
  return (
    <section {...stylex.props(layout.section)}>
      <T.H3>Type</T.H3>
      <div {...stylex.props(styles.rows)}>
        {library.foundations.textStyles.map((style) => {
          const size = Number(values.get(style.fontSize));
          const lineHeight = Number(values.get(style.lineHeight));
          const weight = Number(values.get(style.fontWeight));
          return (
            <div key={style.name} {...stylex.props(styles.row)}>
              <span {...stylex.props(styles.label)}>{style.name}</span>
              <span {...stylex.props(styles.sample, styles.type(size, lineHeight, weight))}>
                The quick brown fox jumps over the lazy dog
              </span>
              <code {...stylex.props(text.mono, styles.values)}>
                {size}/{lineHeight} {weight}
              </code>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Scale({ collections, name }: { collections: Collections; name: "Spacing" | "Radius" }) {
  const collection = collections.find((entry) => entry.name === name);
  if (!collection) return null;
  return (
    <section {...stylex.props(layout.section)}>
      <T.H3>{name}</T.H3>
      <div {...stylex.props(styles.rows)}>
        {collection.variables.map((variable) => {
          const value = Number(variable.values["Value"]);
          return (
            <div key={variable.token} {...stylex.props(styles.row)}>
              <code {...stylex.props(text.mono, styles.label)}>{variable.token}</code>
              {name === "Spacing" ? (
                <span {...stylex.props(styles.bar, styles.width(value))} />
              ) : (
                <span {...stylex.props(styles.corner, styles.rounded(Math.min(value, 24)))} />
              )}
              <code {...stylex.props(text.mono, styles.values)}>{value}px</code>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Elevation({ library }: { library: Library }) {
  return (
    <section {...stylex.props(layout.section)}>
      <T.H3>Elevation</T.H3>
      <div {...stylex.props(styles.elevations)}>
        {library.foundations.effectStyles.map((style) => (
          <div
            key={style.token}
            {...stylex.props(
              styles.elevation,
              styles.shadow(
                style.shadows
                  .map((s) => `${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${css(s.paint.color)}`)
                  .join(", "),
              ),
            )}
          >
            <span {...stylex.props(styles.colorName)}>{style.name}</span>
            <code {...stylex.props(text.mono, styles.values)}>{style.token}</code>
          </div>
        ))}
      </div>
    </section>
  );
}

function tokenValues(collections: Collections): Map<string, number | string> {
  const values = new Map<string, number | string>();
  for (const collection of collections) {
    for (const variable of collection.variables) {
      const value = variable.values[collection.modes[0] ?? ""];
      if (typeof value === "number" || typeof value === "string") values.set(variable.token, value);
    }
  }
  return values;
}

function asRgba(value: Rgba | number | string | undefined): Rgba | undefined {
  return typeof value === "object" ? value : undefined;
}

function css({ r, g, b, a }: Rgba): string {
  return `rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)} / ${a})`;
}

function hex(color: Rgba): string {
  return toHex(color).toUpperCase();
}

const WHITE: Rgba = { r: 1, g: 1, b: 1, a: 1 };
const BLACK: Rgba = { r: 0, g: 0, b: 0, a: 1 };

function readable(color: Rgba): Rgba {
  return contrast(color, WHITE) >= contrast(color, BLACK) ? WHITE : BLACK;
}

const styles = stylex.create({
  skeleton: {
    height: "24rem",
  },
  colorGrid: {
    display: "grid",
    gap: spacing["4"],
    gridTemplateColumns: "repeat(auto-fill, minmax(14rem, 1fr))",
  },
  colorCard: {
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  swatches: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    height: "4.5rem",
  },
  swatch: {
    alignItems: "flex-end",
    boxSizing: "border-box",
    display: "flex",
    fontSize: typography.fontSizeXs,
    justifyContent: "space-between",
    padding: spacing["2"],
  },
  fill: (color: string) => ({
    backgroundColor: color,
  }),
  ink: (color: string) => ({
    color,
  }),
  mode: {
    opacity: 0.8,
  },
  colorMeta: {
    display: "flex",
    flexDirection: "column",
    gap: spacing["1"],
    padding: spacing["3"],
  },
  colorName: {
    alignItems: "center",
    display: "flex",
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    justifyContent: "space-between",
  },
  values: {
    color: colors.mutedForeground,
  },
  rows: {
    display: "flex",
    flexDirection: "column",
    gap: spacing["3"],
  },
  row: {
    alignItems: "center",
    display: "grid",
    gap: spacing["4"],
    gridTemplateColumns: "10rem minmax(0, 1fr) 6rem",
  },
  label: {
    color: colors.mutedForeground,
    fontSize: typography.fontSizeSm,
  },
  sample: {
    color: colors.foreground,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  type: (size: number, lineHeight: number, weight: number) => ({
    fontSize: `${size}px`,
    fontWeight: weight,
    lineHeight: `${lineHeight}px`,
  }),
  bar: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    height: spacing["2"],
  },
  width: (value: number) => ({
    width: `${value}px`,
  }),
  corner: {
    backgroundColor: colors.muted,
    borderColor: colors.border,
    borderStyle: "solid",
    borderWidth: 1,
    height: "3rem",
    width: "3rem",
  },
  rounded: (value: number) => ({
    borderRadius: `${value}px`,
  }),
  elevations: {
    display: "grid",
    gap: spacing["6"],
    gridTemplateColumns: "repeat(auto-fill, minmax(12rem, 1fr))",
  },
  elevation: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    display: "flex",
    flexDirection: "column",
    gap: spacing["1"],
    padding: spacing["4"],
  },
  shadow: (value: string) => ({
    boxShadow: value,
  }),
});
