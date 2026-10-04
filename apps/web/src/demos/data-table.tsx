"use client";

import * as stylex from "@stylexjs/stylex";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DataTable,
  type DataTableColumnDef,
  DataTableColumnsMenu,
  useDataTable,
} from "@/components/ui/data-table";
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

const COLUMNS: DataTableColumnDef<Payment>[] = [
  { accessorKey: "id", header: "Invoice" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={STATUS_VARIANT[row.original.status]}>{row.original.status}</Badge>
    ),
  },
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => (
      <div {...stylex.props(styles.customer)}>
        <span>{row.original.customer}</span>
        <span {...stylex.props(styles.email)}>{row.original.email}</span>
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <span {...stylex.props(styles.amount)}>{currency.format(row.original.amount)}</span>
    ),
    meta: { align: "end" },
  },
  {
    id: "actions",
    header: () => <span {...stylex.props(styles.srOnly)}>Actions</span>,
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => (
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${row.original.id}`} />
          }
        >
          <MoreIcon />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          <DropdownMenu.Item onClick={() => void navigator.clipboard.writeText(row.original.id)}>
            Copy invoice ID
          </DropdownMenu.Item>
          <DropdownMenu.Item>View customer</DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item variant="destructive">Void invoice</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    ),
    meta: { align: "end" },
  },
];

export default function DataTableDemo() {
  const table = useDataTable({
    columns: COLUMNS,
    data: PAYMENTS,
    getRowId: (row) => row.id,
    pageSize: 5,
  });

  return (
    <DataTable
      table={table}
      label="Payments"
      selectable
      style={styles.table}
      toolbar={
        <>
          <Input
            aria-label="Filter payments"
            placeholder="Filter payments…"
            value={table.state.globalFilter ?? ""}
            onValueChange={table.setGlobalFilter}
            style={styles.filter}
          />
          <div {...stylex.props(styles.spacer)} />
          <DataTableColumnsMenu table={table} />
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
