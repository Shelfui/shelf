import * as stylex from "@stylexjs/stylex";
import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/site/code-block";
import { Code, Definitions, PageHeader, Prose, Section } from "@/components/site/docs-page";
import { demos } from "@/demos";
import { components } from "@/docs/components";
import { colors, radius, spacing, typography } from "@/styles/shelf/tokens.stylex";
import { site } from "@/styles/site.stylex";

export const metadata: Metadata = {
  title: "Charts",
  description:
    "Source-owned charts built on Recharts, composed from small parts and themed with the same tokens as the rest of Shelf.",
  alternates: { canonical: "/docs/charts" },
};

const COMPOSITION = `import * as Chart from "@/components/ui/chart";
import { Area, AreaChart } from "@/components/ui/chart-area";

<AreaChart aria-label="Revenue by month" data={data}>
  <Chart.Grid />
  <Chart.XAxis dataKey="month" />
  <Chart.YAxis format={{ notation: "compact", style: "currency", currency: "USD" }} />
  <Chart.Tooltip />
  <Chart.Legend />
  <Area dataKey="revenue" name="Revenue" />
  <Area dataKey="refunds" name="Refunds" color={seriesColors[1]} />
</AreaChart>`;

const THEMING = `import * as stylex from "@stylexjs/stylex";
import { colors } from "@/styles/shelf/tokens.stylex";

// Series colors are chart1 to chart6, greys by default. Gridlines and the hover cursor have their own tokens.
export const brandTheme = stylex.createTheme(colors, {
  chart1: "oklch(0.6 0.2 280)",
  chart2: "oklch(0.7 0.15 80)",
  chartGrid: "#dcdcf0",
});

<div {...stylex.props(brandTheme)}>
  <AreaChart … />
</div>`;

const TABLE = `import * as Table from "@/components/ui/table";

// Offer the same numbers as a table, for people who prefer them or cannot see the chart.
<Table.Root aria-label="Revenue by month">…</Table.Root>`;

const chartComponents = components.filter((component) => component.group === "charts");
const gallery = chartComponents.filter((component) => component.name !== "chart");

export default function Charts() {
  return (
    <>
      <PageHeader
        title="Charts"
        description="Source you own, built on Recharts, composed from small parts, and themed with the same tokens as every other component."
      />
      <Prose>
        Each chart is a few files copied into your app by <Code>shelf add</Code>. You import chart
        parts from those files, never from Recharts, so a Recharts change is fixed in one place you
        control. Every chart has an accessible name, works with the keyboard, and follows your light
        and dark themes.
      </Prose>

      <Section title="Gallery">
        <ul {...stylex.props(styles.grid)}>
          {gallery.map((component) => {
            const Demo = demos[component.name];
            return (
              <li key={component.name} {...stylex.props(styles.item)}>
                <div {...stylex.props(styles.card)}>
                  <div {...stylex.props(styles.preview)}>{Demo && <Demo />}</div>
                  <Link href={`/docs/components/${component.name}`} {...stylex.props(styles.title)}>
                    {component.title}
                  </Link>
                  <p {...stylex.props(styles.description)}>{component.description}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section title="Composition">
        <Prose>
          A chart is a container for its kind, plus the shared parts from <Code>chart</Code>. Add
          only the parts you want. A series takes its color from <Code>color</Code>, which defaults
          to the first series color.
        </Prose>
        <CodeBlock code={COMPOSITION} />
      </Section>

      <Section title="Props are the same everywhere">
        <Definitions
          items={[
            {
              term: <Code>aria-label</Code>,
              text: "Required. Names the chart for screen readers.",
            },
            { term: <Code>data</Code>, text: "An array of objects, one per point, row, or slice." },
            {
              term: <Code>dataKey</Code>,
              text: "The key in each item that holds a series' value. It also names the series in the legend and tooltip.",
            },
            {
              term: <Code>color</Code>,
              text: "A color for one series. Use a token, such as seriesColors[1].",
            },
            {
              term: <Code>format</Code>,
              text: "Intl.NumberFormat options, or a function, for ticks and tooltip values.",
            },
            {
              term: <Code>locale</Code>,
              text: "The locale numbers print in. Defaults to the browser's.",
            },
            { term: <Code>curve</Code>, text: "smooth, linear, or step, for lines and areas." },
            { term: <Code>stacked</Code>, text: "Stacks a series on the others that are stacked." },
            {
              term: <Code>aspect</Code>,
              text: "Width over height. A chart fills its container's width and keeps this shape.",
            },
            {
              term: <Code>hiddenSeries</Code>,
              text: "Series hidden through the legend. Control it with onHiddenSeriesChange, or leave it uncontrolled.",
            },
          ]}
        />
      </Section>

      <Section title="Choosing a chart">
        <Definitions
          items={chartComponents
            .filter((component) => component.name !== "chart")
            .map((component) => ({
              term: (
                <Link href={`/docs/components/${component.name}`} {...stylex.props(styles.link)}>
                  {component.title}
                </Link>
              ),
              text: component.useWhen,
            }))}
        />
      </Section>

      <Section title="Theming">
        <Prose>
          Charts use the same <Code>colors</Code> as everything else. Series are <Code>chart1</Code>{" "}
          to <Code>chart6</Code>, which are greys by default. Tell series apart with{" "}
          <Code>pattern</Code> (<Code>solid</Code>, <Code>hatch</Code>, <Code>dots</Code>), or
          override the tokens for a colored palette. Past six series, group the smallest into Other.
        </Prose>
        <CodeBlock code={THEMING} />
      </Section>

      <Section title="Accessibility">
        <Prose>
          Every chart is a named group, and its plot responds to the arrow keys. The legend is a row
          of toggle buttons. Color is never the only signal: values are in the tooltip and legend.
          For people who prefer numbers, offer a table beside the chart.
        </Prose>
        <CodeBlock code={TABLE} />
      </Section>

      <Section title="Limits">
        <Definitions
          items={[
            {
              term: "Data size",
              text: "Charts are SVG, which is comfortable up to about 5,000 points per chart. Beyond that, aggregate the data first.",
            },
            {
              term: "Server rendering",
              text: "A chart measures its container in the browser, so the server sends an empty frame with the right shape and the chart draws on load. There is no layout shift.",
            },
            {
              term: "Server Components",
              text: "A format given as a function must be passed from a client component. Intl options work from anywhere.",
            },
          ]}
        />
      </Section>
    </>
  );
}

const styles = stylex.create({
  grid: {
    gap: spacing["4"],
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(20rem, 1fr))",
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  item: {
    display: "grid",
  },
  card: {
    gap: spacing["3"],
    alignContent: "start",
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    color: colors.cardForeground,
    display: "grid",
    padding: spacing["6"],
    textDecoration: "none",
  },
  preview: {
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    minHeight: "12rem",
  },
  title: {
    color: colors.foreground,
    fontSize: site.fontSizeXl,
    textDecoration: "none",
    letterSpacing: "-0.01em",
    lineHeight: 1.375,
  },
  description: {
    color: colors.mutedForeground,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
    margin: 0,
    textWrap: "pretty",
  },
  link: {
    color: colors.foreground,
  },
});
