"use client";

import * as stylex from "@stylexjs/stylex";
import { useId, useState } from "react";
import { Badge, type BadgeVariant } from "../../components/badge/badge";
import { Button } from "../../components/button/button";
import type { DataTableColumn } from "../../components/data-table/data-table";
import { DataTable, DataTableColumnsMenu } from "../../components/data-table/data-table";
import * as DropdownMenu from "../../components/dropdown-menu/dropdown-menu";
import * as Empty from "../../components/empty/empty";
import { FileTextIcon, MoreIcon, PlusIcon, SearchIcon } from "../../components/icons/icons";
import { Input } from "../../components/input/input";
import * as Tabs from "../../components/tabs/tabs";
import { colors, radius, spacing, typography } from "../../foundations/tokens.stylex";

export type InvoiceStatus = "draft" | "pending" | "overdue" | "paid";

export interface Invoice {
  id: string;
  customer: string;
  /** In dollars. */
  amount: number;
  status: InvoiceStatus;
  /** An ISO date, such as `2026-09-01`. */
  dueDate: string;
}

const STATUSES: { value: InvoiceStatus; label: string; badge: BadgeVariant }[] = [
  { value: "draft", label: "Draft", badge: "outline" },
  { value: "pending", label: "Pending", badge: "default" },
  { value: "overdue", label: "Overdue", badge: "destructive" },
  { value: "paid", label: "Paid", badge: "secondary" },
];

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const date = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });

const COLUMNS: DataTableColumn<Invoice>[] = [
  { id: "id", header: "Invoice", cell: (row) => row.id, sortValue: (row) => row.id },
  {
    id: "customer",
    header: "Customer",
    cell: (row) => row.customer,
    sortValue: (row) => row.customer,
  },
  {
    id: "status",
    header: "Status",
    cell: (row) => {
      const status = STATUSES.find((option) => option.value === row.status)!;
      return <Badge variant={status.badge}>{status.label}</Badge>;
    },
  },
  {
    id: "dueDate",
    header: "Due",
    cell: (row) => date.format(new Date(row.dueDate)),
    sortValue: (row) => row.dueDate,
  },
  {
    id: "amount",
    header: "Amount",
    cell: (row) => currency.format(row.amount),
    sortValue: (row) => row.amount,
    align: "end",
  },
  {
    id: "actions",
    header: <ActionsLabel />,
    cell: (row) => (
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${row.id}`} />}
        >
          <MoreIcon />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          <DropdownMenu.Item>View invoice</DropdownMenu.Item>
          <DropdownMenu.Item>Download PDF</DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item variant="destructive">Void invoice</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    ),
    align: "end",
  },
];

function ActionsLabel() {
  return <span {...stylex.props(styles.hidden)}>Actions</span>;
}

export interface InvoicesTableProps {
  /** The starting invoices. The table keeps its own copy, so Mark paid updates it in place. */
  invoices: Invoice[];
  onCreate?: () => void;
  /** Called with the selected invoice ids when you send reminders. */
  onRemind?: (ids: string[]) => void;
  /** Called with the selected invoice ids when you mark them paid. */
  onMarkPaid?: (ids: string[]) => void;
}

/**
 * An invoices page section: status tabs with counts, search, and column visibility above
 * a sortable, paginated table. Selecting rows swaps the toolbar for bulk actions, and the
 * total of the filtered invoices sits below the table.
 */
export function InvoicesTable({ invoices, onCreate, onRemind, onMarkPaid }: InvoicesTableProps) {
  const headingId = useId();
  const [items, setItems] = useState(invoices);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<InvoiceStatus | "all">("all");
  const [visible, setVisible] = useState(COLUMNS.map((column) => column.id));
  const [selected, setSelected] = useState<string[]>([]);
  const [selection, setSelection] = useState(0);
  const [notice, setNotice] = useState("");

  const search = query.trim().toLowerCase();
  const matching = items.filter(
    (invoice) =>
      invoice.customer.toLowerCase().includes(search) || invoice.id.toLowerCase().includes(search),
  );
  const rows = matching.filter((invoice) => status === "all" || invoice.status === status);
  const total = rows.reduce((sum, invoice) => sum + invoice.amount, 0);

  function clearSelection() {
    setSelected([]);
    setSelection((key) => key + 1);
  }

  function changeStatus(next: InvoiceStatus | "all") {
    setStatus(next);
    setNotice("");
    clearSelection();
  }

  function clearFilters() {
    setQuery("");
    changeStatus("all");
  }

  function remind() {
    onRemind?.(selected);
    setNotice(`Reminder sent for ${plural(selected.length)}.`);
    clearSelection();
  }

  function markPaid() {
    onMarkPaid?.(selected);
    setItems((current) =>
      current.map((invoice) =>
        selected.includes(invoice.id) ? { ...invoice, status: "paid" } : invoice,
      ),
    );
    setNotice(`Marked ${plural(selected.length)} as paid.`);
    clearSelection();
  }

  return (
    <section aria-labelledby={headingId} {...stylex.props(styles.section)}>
      <div {...stylex.props(styles.header)}>
        <div {...stylex.props(styles.intro)}>
          <h2 id={headingId} {...stylex.props(styles.heading)}>
            Invoices
          </h2>
          <p {...stylex.props(styles.text)}>Track what you’ve billed and what’s been paid.</p>
        </div>
        <Button onClick={onCreate}>
          <PlusIcon />
          New invoice
        </Button>
      </div>
      {items.length === 0 ? (
        <Empty.Root style={styles.empty}>
          <Empty.Header>
            <Empty.Media variant="icon">
              <FileTextIcon />
            </Empty.Media>
            <Empty.Title>No invoices yet</Empty.Title>
            <Empty.Description>
              Invoices you send appear here, with their payment status.
            </Empty.Description>
          </Empty.Header>
          <Empty.Content>
            <Button variant="outline" onClick={onCreate}>
              Create your first invoice
            </Button>
          </Empty.Content>
        </Empty.Root>
      ) : (
        <Tabs.Root value={status} onValueChange={changeStatus} style={styles.tabs}>
          <Tabs.List aria-label="Status" style={styles.tabList}>
            {[{ value: "all" as const, label: "All" }, ...STATUSES].map((option) => (
              <Tabs.Tab key={option.value} value={option.value}>
                {option.label}
                <span {...stylex.props(styles.tabCount)}>
                  {option.value === "all"
                    ? matching.length
                    : matching.filter((invoice) => invoice.status === option.value).length}
                </span>
              </Tabs.Tab>
            ))}
          </Tabs.List>
          <Tabs.Panel value={status} style={styles.panel}>
            {selected.length > 0 ? (
              <div
                role="toolbar"
                aria-label="Bulk actions"
                {...stylex.props(styles.toolbar, styles.bulk)}
              >
                <span {...stylex.props(styles.bulkCount)}>{selected.length} selected</span>
                <Button size="sm" variant="outline" onClick={remind}>
                  Send reminder
                </Button>
                <Button size="sm" variant="outline" onClick={markPaid}>
                  Mark paid
                </Button>
                <Button size="sm" variant="ghost" onClick={clearSelection} style={styles.end}>
                  Clear
                </Button>
              </div>
            ) : (
              <div {...stylex.props(styles.toolbar)}>
                <Input
                  type="search"
                  aria-label="Search invoices"
                  placeholder="Search invoices…"
                  value={query}
                  onValueChange={setQuery}
                  style={styles.search}
                />
                <div {...stylex.props(styles.end)}>
                  <DataTableColumnsMenu
                    columns={COLUMNS.filter((column) => column.id !== "actions")}
                    visible={visible}
                    onVisibleChange={(next) => setVisible([...next, "actions"])}
                  />
                </div>
              </div>
            )}
            <p role="status" {...stylex.props(styles.notice)}>
              {notice}
            </p>
            {rows.length === 0 ? (
              <Empty.Root style={styles.empty}>
                <Empty.Header>
                  <Empty.Media variant="icon">
                    <SearchIcon />
                  </Empty.Media>
                  <Empty.Title>No matching invoices</Empty.Title>
                  <Empty.Description>Try another search or status.</Empty.Description>
                </Empty.Header>
                <Empty.Content>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
                </Empty.Content>
              </Empty.Root>
            ) : (
              <>
                <DataTable
                  key={selection}
                  label="Invoices"
                  columns={COLUMNS.filter((column) => visible.includes(column.id))}
                  data={rows}
                  getRowId={(row) => row.id}
                  pageSize={5}
                  selectable
                  onSelectionChange={setSelected}
                />
                <p {...stylex.props(styles.total)}>
                  <span>{plural(rows.length)}</span>
                  <span>
                    Total <strong {...stylex.props(styles.amount)}>{currency.format(total)}</strong>
                  </span>
                </p>
              </>
            )}
          </Tabs.Panel>
        </Tabs.Root>
      )}
    </section>
  );
}

function plural(count: number) {
  return `${count} ${count === 1 ? "invoice" : "invoices"}`;
}

const styles = stylex.create({
  section: {
    gap: spacing["4"],
    display: "flex",
    flexDirection: "column",
    fontFamily: typography.fontFamily,
    minWidth: 0,
    width: "100%",
  },
  header: {
    gap: spacing["4"],
    alignItems: "flex-start",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  intro: {
    gap: spacing["1"],
    display: "flex",
    flexDirection: "column",
  },
  heading: {
    margin: 0,
    color: colors.foreground,
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightSemibold,
    lineHeight: typography.lineHeightLg,
  },
  text: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
  },
  tabs: {
    gap: spacing["3"],
    minWidth: 0,
  },
  tabList: {
    alignSelf: "flex-start",
    maxWidth: "100%",
    overflowX: "auto",
  },
  tabCount: {
    color: colors.mutedForeground,
    fontVariantNumeric: "tabular-nums",
    marginInlineStart: spacing["1.5"],
  },
  panel: {
    gap: spacing["3"],
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  toolbar: {
    gap: spacing["2"],
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    minHeight: "2.25rem",
  },
  bulk: {
    borderRadius: radius.md,
    paddingInline: spacing["2"],
    backgroundColor: colors.muted,
  },
  bulkCount: {
    color: colors.foreground,
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    marginInlineEnd: spacing["2"],
  },
  search: {
    maxWidth: "16rem",
  },
  end: {
    marginInlineStart: "auto",
  },
  notice: {
    margin: 0,
    color: colors.mutedForeground,
    display: {
      default: null,
      ":empty": "none",
    },
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
  },
  total: {
    margin: 0,
    gap: spacing["4"],
    color: colors.mutedForeground,
    display: "flex",
    fontSize: typography.fontSizeSm,
    justifyContent: "space-between",
    lineHeight: typography.lineHeightSm,
  },
  amount: {
    color: colors.foreground,
    fontVariantNumeric: "tabular-nums",
    fontWeight: typography.fontWeightSemibold,
  },
  empty: {
    borderColor: colors.border,
    borderStyle: "dashed",
    borderWidth: 1,
  },
  hidden: {
    margin: "-1px",
    padding: 0,
    borderWidth: 0,
    overflow: "hidden",
    clip: "rect(0 0 0 0)",
    position: "absolute",
    whiteSpace: "nowrap",
    height: "1px",
    width: "1px",
  },
});
