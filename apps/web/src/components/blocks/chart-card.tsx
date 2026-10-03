"use client";

import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import * as Card from "@/components/ui/card";
import * as Chart from "@/components/ui/chart";
import { Area, AreaChart } from "@/components/ui/chart-area";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup } from "@/components/ui/toggle-group";
import { colors, spacing, typography } from "@/styles/shelf/tokens.stylex";

const RANGES = [
  { value: "7d", label: "7 days", days: 7 },
  { value: "30d", label: "30 days", days: 30 },
  { value: "90d", label: "90 days", days: 90 },
] as const;

type Range = (typeof RANGES)[number]["value"];

const USD = { style: "currency", currency: "USD", maximumFractionDigits: 0 } as const;
const END = Date.UTC(2026, 8, 30);
const DAY = 24 * 60 * 60 * 1000;

/** Sample data. Replace this with your own series, one item per day. */
function revenueFor(days: number) {
  return Array.from({ length: days }, (_, i) => ({
    date: END - (days - 1 - i) * DAY,
    revenue: Math.round(
      2400 + i * (90 / days) * 14 + Math.sin(i / 2.4) * 420 + Math.cos(i / 5) * 260,
    ),
  }));
}

const dateLabel = (value: number) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(
    value,
  );

/**
 * A card with a headline figure, how it changed, a range switch, and an area chart. The
 * range is local state here; with real data, fetch or filter by it.
 */
export function ChartCard() {
  const [range, setRange] = useState<Range>("30d");
  const days = RANGES.find((r) => r.value === range)?.days ?? 30;
  const data = revenueFor(days);

  const total = data.reduce((sum, d) => sum + d.revenue, 0);
  const first = data[0]?.revenue ?? 0;
  const last = data[data.length - 1]?.revenue ?? 0;
  const change = first === 0 ? 0 : ((last - first) / first) * 100;

  return (
    <Card.Root>
      <Card.Header>
        <div {...stylex.props(styles.heading)}>
          <div>
            <Card.Description>Revenue</Card.Description>
            <Card.Title style={styles.total}>
              {new Intl.NumberFormat("en-US", USD).format(total)}
            </Card.Title>
          </div>
          <ToggleGroup
            aria-label="Date range"
            value={[range]}
            onValueChange={(next) => {
              const picked = RANGES.find((r) => r.value === next[0]);
              if (picked) setRange(picked.value);
            }}
          >
            {RANGES.map((r) => (
              <Toggle key={r.value} value={r.value} variant="outline" size="sm">
                {r.label}
              </Toggle>
            ))}
          </ToggleGroup>
        </div>
        <Badge variant={change >= 0 ? "secondary" : "outline"}>
          {change >= 0 ? "+" : "−"}
          {Math.abs(change).toFixed(1)}% since the start of the period
        </Badge>
      </Card.Header>
      <Card.Content>
        <AreaChart aria-label={`Daily revenue, last ${days} days`} data={data}>
          <Chart.Grid />
          <Chart.XAxis
            dataKey="date"
            format={dateLabel}
            interval="preserveStartEnd"
            minTickGap={40}
          />
          <Chart.YAxis format={{ notation: "compact", style: "currency", currency: "USD" }} />
          <Chart.Tooltip format={USD} labelFormat={dateLabel} />
          <Area dataKey="revenue" name="Revenue" />
        </AreaChart>
      </Card.Content>
    </Card.Root>
  );
}

const styles = stylex.create({
  heading: {
    gap: spacing["4"],
    alignItems: "flex-start",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  total: {
    color: colors.foreground,
    fontSize: typography.fontSizeLg,
    fontVariantNumeric: "tabular-nums",
    lineHeight: typography.lineHeightLg,
  },
});
