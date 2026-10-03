"use client";

import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn, DataTableColumnsMenu } from "@/components/ui/data-table";
import * as DropdownMenu from "@/components/ui/dropdown-menu";
import { MoreIcon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { colors } from "@/styles/shelf/tokens.stylex";

type Status = "Paid" | "Pending" | "Overdue" | "Draft";

interface Payment {
  id: string;
  customer: string;
  email: string;
  status: Status;
  amount: number;
}

const PAYMENTS: Payment[] = [
  {
    id: "INV-1042",
    customer: "Acme Inc.",
    email: "billing@acme.com",
    status: "Paid",
    amount: 1200,
  },
  { id: "INV-1043", customer: "Globex", email: "ap@globex.com", status: "Overdue", amount: 860 },
  {
    id: "INV-1044",
    customer: "Initech",
    email: "finance@initech.com",
    status: "Pending",
    amount: 2450,
  },
  { id: "INV-1045", customer: "Umbrella", email: "pay@umbrella.co", status: "Paid", amount: 640.5 },
  { id: "INV-1046", customer: "Hooli", email: "invoices@hooli.xyz", status: "Draft", amount: 3100 },
  {
    id: "INV-1047",
    customer: "Stark Industries",
    email: "ap@stark.com",
    status: "Paid",
    amount: 12800,
  },
  {
    id: "INV-1048",
    customer: "Wayne Enterprises",
    email: "billing@wayne.com",
    status: "Pending",
    amount: 5320,
  },
  {
    id: "INV-1049",
    customer: "Soylent",
    email: "accounts@soylent.com",
    status: "Overdue",
    amount: 415.25,
  },
  { id: "INV-1050", customer: "Cyberdyne", email: "ap@cyberdyne.io", status: "Paid", amount: 990 },
  {
    id: "INV-1051",
    customer: "Tyrell Corp.",
    email: "finance@tyrell.com",
    status: "Draft",
    amount: 7600,
  },
];

const STATUS_VARIANT: Record<Status, BadgeVariant> = {
  Paid: "secondary",
  Pending: "outline",
  Overdue: "destructive",
  Draft: "outline",
};

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const COLUMNS: DataTableColumn<Payment>[] = [
  { id: "invoice", header: "Invoice", cell: (row) => row.id, sortValue: (row) => row.id },
  {
    id: "status",
    header: "Status",
    cell: (row) => <Badge variant={STATUS_VARIANT[row.status]}>{row.status}</Badge>,
    sortValue: (row) => row.status,
  },
  {
    id: "customer",
    header: "Customer",
    cell: (row) => (
      <div {...stylex.props(styles.customer)}>
        <span>{row.customer}</span>
        <span {...stylex.props(styles.email)}>{row.email}</span>
      </div>
    ),
    sortValue: (row) => row.customer,
  },
  {
    id: "amount",
    header: "Amount",
    cell: (row) => <span {...stylex.props(styles.amount)}>{currency.format(row.amount)}</span>,
    sortValue: (row) => row.amount,
    align: "end",
  },
  {
    id: "actions",
    header: <VisuallyHidden>Actions</VisuallyHidden>,
    cell: (row) => (
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${row.id}`} />}
        >
          <MoreIcon />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          <DropdownMenu.Item onClick={() => void navigator.clipboard.writeText(row.id)}>
            Copy invoice ID
          </DropdownMenu.Item>
          <DropdownMenu.Item>View customer</DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item variant="destructive">Void invoice</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    ),
    align: "end",
  },
];

function VisuallyHidden({ children }: { children: string }) {
  return <span {...stylex.props(styles.srOnly)}>{children}</span>;
}

const HIDEABLE = COLUMNS.filter((column) => column.id !== "actions");

export default function DataTableDemo() {
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(COLUMNS.map((column) => column.id));
  const search = query.trim().toLowerCase();

  return (
    <DataTable
      label="Payments"
      columns={COLUMNS.filter((column) => column.id === "actions" || visible.includes(column.id))}
      data={PAYMENTS.filter((row) =>
        [row.customer, row.email, row.id].some((value) => value.toLowerCase().includes(search)),
      )}
      getRowId={(row) => row.id}
      pageSize={5}
      selectable
      style={styles.table}
      toolbar={
        <>
          <Input
            aria-label="Filter payments"
            placeholder="Filter payments…"
            value={query}
            onValueChange={setQuery}
            style={styles.filter}
          />
          <div {...stylex.props(styles.spacer)} />
          <DataTableColumnsMenu columns={HIDEABLE} visible={visible} onVisibleChange={setVisible} />
        </>
      }
    />
  );
}

const styles = stylex.create({
  table: { maxWidth: "48rem" },
  filter: { maxWidth: "16rem" },
  spacer: { flexGrow: 1 },
  customer: { display: "flex", flexDirection: "column" },
  email: { color: colors.mutedForeground },
  amount: { fontVariantNumeric: "tabular-nums" },
  srOnly: {
    clip: "rect(0 0 0 0)",
    overflow: "hidden",
    position: "absolute",
    whiteSpace: "nowrap",
    height: "1px",
    width: "1px",
  },
});
