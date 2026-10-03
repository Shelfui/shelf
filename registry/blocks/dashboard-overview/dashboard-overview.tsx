import * as stylex from "@stylexjs/stylex";
import { Badge, type BadgeVariant } from "../../components/badge/badge";
import * as Card from "../../components/card/card";
import * as Chart from "../../components/chart/chart";
import { Area, AreaChart } from "../../components/chart-area/chart-area";
import { Progress } from "../../components/progress/progress";
import * as Table from "../../components/table/table";
import { colors, spacing, typography } from "../../foundations/tokens.stylex";

const STATS = [
  { label: "Revenue", value: "$48,120.00", change: "+12.4%", up: true },
  { label: "Outstanding", value: "$12,480.00", change: "+3.1%", up: false },
  { label: "Customers", value: "1,284", change: "+48", up: true },
  { label: "Avg. days to pay", value: "18", change: "−2", up: true },
];

const REVENUE = [
  { month: "Jan", revenue: 18600 },
  { month: "Feb", revenue: 20500 },
  { month: "Mar", revenue: 23700 },
  { month: "Apr", revenue: 22100 },
  { month: "May", revenue: 27800 },
  { month: "Jun", revenue: 31400 },
];

const GOALS = [
  { label: "Quarterly revenue", value: 72 },
  { label: "New customers", value: 54 },
  { label: "Invoices paid on time", value: 88 },
];

const RECENT: {
  id: string;
  customer: string;
  status: string;
  variant: BadgeVariant;
  amount: string;
}[] = [
  { id: "INV-1046", customer: "Hooli", status: "Pending", variant: "outline", amount: "$3,100.00" },
  { id: "INV-1045", customer: "Umbrella", status: "Paid", variant: "secondary", amount: "$640.00" },
  {
    id: "INV-1044",
    customer: "Initech",
    status: "Overdue",
    variant: "destructive",
    amount: "$2,450.00",
  },
  { id: "INV-1043", customer: "Globex", status: "Pending", variant: "outline", amount: "$860.00" },
  {
    id: "INV-1042",
    customer: "Acme Inc.",
    status: "Paid",
    variant: "secondary",
    amount: "$1,200.00",
  },
];

/**
 * A dashboard home: headline stats with their change this month, progress toward goals,
 * and the latest invoices. Replace the constants at the top with your data.
 */
export function DashboardOverview() {
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
              <Card.Content>
                <Badge variant={stat.up ? "secondary" : "outline"}>{stat.change} this month</Badge>
              </Card.Content>
            </Card.Root>
          </li>
        ))}
      </ul>
      <Card.Root>
        <Card.Header>
          <Card.Title>Revenue</Card.Title>
          <Card.Description>Revenue by month this year.</Card.Description>
        </Card.Header>
        <Card.Content>
          <AreaChart aria-label="Revenue by month" data={REVENUE} aspect={3}>
            <Chart.Grid />
            <Chart.XAxis dataKey="month" />
            <Chart.YAxis format={{ notation: "compact", style: "currency", currency: "USD" }} />
            <Chart.Tooltip
              format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
            />
            <Area dataKey="revenue" name="Revenue" />
          </AreaChart>
        </Card.Content>
      </Card.Root>
      <div {...stylex.props(styles.panels)}>
        <Card.Root style={styles.recent}>
          <Card.Header>
            <Card.Title>Recent invoices</Card.Title>
            <Card.Description>The last five invoices you sent.</Card.Description>
          </Card.Header>
          <Card.Content>
            <Table.Root aria-label="Recent invoices">
              <Table.Header>
                <Table.Row>
                  <Table.Head>Invoice</Table.Head>
                  <Table.Head style={styles.wide}>Customer</Table.Head>
                  <Table.Head>Status</Table.Head>
                  <Table.Head style={styles.end}>Amount</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {RECENT.map((invoice) => (
                  <Table.Row key={invoice.id}>
                    <Table.Cell>{invoice.id}</Table.Cell>
                    <Table.Cell style={styles.wide}>{invoice.customer}</Table.Cell>
                    <Table.Cell>
                      <Badge variant={invoice.variant}>{invoice.status}</Badge>
                    </Table.Cell>
                    <Table.Cell style={styles.end}>{invoice.amount}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Card.Content>
        </Card.Root>
        <Card.Root style={styles.goals}>
          <Card.Header>
            <Card.Title>Goals</Card.Title>
            <Card.Description>Progress this quarter.</Card.Description>
          </Card.Header>
          <Card.Content style={styles.goalList}>
            {GOALS.map((goal) => (
              <Progress key={goal.label} label={goal.label} value={goal.value} showValue />
            ))}
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
  value: {
    fontSize: typography.fontSizeLg,
    fontVariantNumeric: "tabular-nums",
    lineHeight: typography.lineHeightLg,
  },
  panels: {
    gap: spacing["4"],
    display: "flex",
    flexWrap: "wrap",
  },
  recent: {
    flexBasis: "28rem",
    flexGrow: 2,
    minWidth: 0,
  },
  goals: {
    flexBasis: "16rem",
    flexGrow: 1,
  },
  goalList: {
    gap: spacing["4"],
    display: "flex",
    flexDirection: "column",
  },
  wide: {
    display: {
      default: "none",
      "@container (min-width: 28rem)": "table-cell",
    },
  },
  end: {
    color: colors.foreground,
    fontVariantNumeric: "tabular-nums",
    textAlign: "end",
  },
});
