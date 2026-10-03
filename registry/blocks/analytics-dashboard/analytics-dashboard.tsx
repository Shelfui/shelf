import * as stylex from "@stylexjs/stylex";
import { Badge } from "../../components/badge/badge";
import * as Card from "../../components/card/card";
import * as Chart from "../../components/chart/chart";
import { seriesColors } from "../../components/chart/chart";
import { Area, AreaChart } from "../../components/chart-area/chart-area";
import { Bar, BarChart } from "../../components/chart-bar/chart-bar";
import { Heatmap } from "../../components/chart-heatmap/chart-heatmap";
import { Pie, PieChart } from "../../components/chart-pie/chart-pie";
import { Sparkline } from "../../components/sparkline/sparkline";
import { colors, spacing, typography } from "../../foundations/tokens.stylex";

const USD = { style: "currency", currency: "USD", maximumFractionDigits: 0 } as const;

const STATS = [
  { label: "Revenue", value: "$48,120", change: "+12.4%", trend: [31, 34, 33, 38, 41, 40, 46, 48] },
  { label: "Orders", value: "1,065", change: "+6.2%", trend: [22, 25, 24, 26, 29, 28, 31, 32] },
  { label: "Visitors", value: "24,810", change: "+3.1%", trend: [40, 38, 42, 41, 44, 43, 45, 47] },
  { label: "Refund rate", value: "2.4%", change: "−0.3%", trend: [9, 8, 9, 7, 7, 6, 6, 5] },
].map((stat) => ({ ...stat, trend: stat.trend.map((value, week) => ({ week, value })) }));

const MONTHS = [
  { month: "Jan", revenue: 18600, refunds: 1200 },
  { month: "Feb", revenue: 20500, refunds: 1500 },
  { month: "Mar", revenue: 23700, refunds: 900 },
  { month: "Apr", revenue: 22100, refunds: 1800 },
  { month: "May", revenue: 27800, refunds: 1100 },
  { month: "Jun", revenue: 31400, refunds: 1400 },
];

const CHANNELS = [
  { channel: "Web", orders: 420 },
  { channel: "Store", orders: 310 },
  { channel: "Partner", orders: 215 },
  { channel: "Phone", orders: 120 },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const HOURS = ["9am", "11am", "1pm", "3pm", "5pm"];
const BUSY = [
  [4, 12, 18, 14, 6],
  [5, 14, 22, 16, 8],
  [3, 11, 20, 19, 9],
  [6, 15, 25, 21, 10],
  [8, 18, 28, 24, 15],
];

/**
 * An analytics page: headline figures with sparklines, revenue over time, orders by channel,
 * and when customers buy. Replace the constants at the top with your data.
 */
export function AnalyticsDashboard() {
  return (
    <div {...stylex.props(styles.root)}>
      <ul aria-label="Key figures" {...stylex.props(styles.stats)}>
        {STATS.map((stat) => (
          <li key={stat.label} {...stylex.props(styles.statItem)}>
            <Card.Root style={styles.stat}>
              <Card.Header>
                <Card.Description>{stat.label}</Card.Description>
                <Card.Title style={styles.value}>{stat.value}</Card.Title>
              </Card.Header>
              <Card.Content style={styles.statFooter}>
                <Badge variant="secondary">{stat.change}</Badge>
                <Sparkline
                  aria-label={`${stat.label}, last 8 weeks`}
                  data={stat.trend}
                  dataKey="value"
                />
              </Card.Content>
            </Card.Root>
          </li>
        ))}
      </ul>

      <div {...stylex.props(styles.row)}>
        <Card.Root style={styles.wide}>
          <Card.Header>
            <Card.Title>Revenue</Card.Title>
            <Card.Description>Revenue and refunds by month.</Card.Description>
          </Card.Header>
          <Card.Content>
            <AreaChart aria-label="Revenue and refunds by month" data={MONTHS}>
              <Chart.Grid />
              <Chart.XAxis dataKey="month" />
              <Chart.YAxis format={{ notation: "compact", style: "currency", currency: "USD" }} />
              <Chart.Tooltip format={USD} />
              <Chart.Legend />
              <Area dataKey="revenue" name="Revenue" />
              <Area dataKey="refunds" name="Refunds" color={seriesColors[1]} pattern="dots" />
            </AreaChart>
          </Card.Content>
        </Card.Root>
        <Card.Root style={styles.narrow}>
          <Card.Header>
            <Card.Title>Orders by channel</Card.Title>
            <Card.Description>Share of orders this quarter.</Card.Description>
          </Card.Header>
          <Card.Content>
            <PieChart aria-label="Orders by channel">
              <Chart.Tooltip />
              <Chart.Legend verticalAlign="bottom" />
              <Pie
                data={CHANNELS}
                dataKey="orders"
                nameKey="channel"
                donut
                centerValue="1,065"
                centerLabel="Orders"
              />
            </PieChart>
          </Card.Content>
        </Card.Root>
      </div>

      <div {...stylex.props(styles.row)}>
        <Card.Root style={styles.narrow}>
          <Card.Header>
            <Card.Title>Orders by channel</Card.Title>
            <Card.Description>Compared across channels.</Card.Description>
          </Card.Header>
          <Card.Content>
            <BarChart aria-label="Orders by channel, bars" data={CHANNELS}>
              <Chart.Grid />
              <Chart.XAxis dataKey="channel" />
              <Chart.YAxis />
              <Chart.Tooltip />
              <Bar dataKey="orders" name="Orders" />
            </BarChart>
          </Card.Content>
        </Card.Root>
        <Card.Root style={styles.wide}>
          <Card.Header>
            <Card.Title>When customers buy</Card.Title>
            <Card.Description>Orders by weekday and hour.</Card.Description>
          </Card.Header>
          <Card.Content>
            <Heatmap
              aria-label="Orders by weekday and hour"
              rows={DAYS}
              columns={HOURS}
              values={BUSY}
              color={seriesColors[3]}
            />
          </Card.Content>
        </Card.Root>
      </div>
    </div>
  );
}

const styles = stylex.create({
  root: {
    gap: spacing["4"],
    containerType: "inline-size",
    display: "flex",
    flexDirection: "column",
    fontFamily: typography.fontFamily,
    minWidth: 0,
    width: "100%",
  },
  stats: {
    margin: 0,
    padding: 0,
    gap: spacing["4"],
    listStyle: "none",
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      "@container (min-width: 20rem)": "repeat(2, minmax(0, 1fr))",
      "@container (min-width: 56rem)": "repeat(4, minmax(0, 1fr))",
    },
  },
  statItem: {
    display: "grid",
  },
  stat: {
    gap: spacing["3"],
  },
  statFooter: {
    gap: spacing["3"],
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
  },
  value: {
    color: colors.foreground,
    fontSize: typography.fontSizeLg,
    fontVariantNumeric: "tabular-nums",
    lineHeight: typography.lineHeightLg,
  },
  row: {
    gap: spacing["4"],
    display: "flex",
    flexWrap: "wrap",
  },
  wide: {
    flexBasis: "28rem",
    flexGrow: 2,
    minWidth: 0,
  },
  narrow: {
    flexBasis: "18rem",
    flexGrow: 1,
    minWidth: 0,
  },
});
