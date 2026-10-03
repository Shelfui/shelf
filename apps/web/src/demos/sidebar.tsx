"use client";

import * as stylex from "@stylexjs/stylex";
import * as Avatar from "@/components/ui/avatar";
import {
  CreditCardIcon,
  FileTextIcon,
  InboxIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { colors, radius, spacing, typography } from "@/styles/shelf/tokens.stylex";

const PLATFORM = [
  { label: "Dashboard", icon: LayoutDashboardIcon },
  { label: "Inbox", icon: InboxIcon },
  { label: "Invoices", icon: FileTextIcon },
  { label: "Customers", icon: UsersIcon },
];

const ACCOUNT = [
  { label: "Billing", icon: CreditCardIcon },
  { label: "Settings", icon: SettingsIcon },
];

const STATS = [
  { label: "Outstanding", value: "$12,480.00" },
  { label: "Paid this month", value: "$38,920.00" },
  { label: "Overdue", value: "3" },
];

const RECENT = [
  { id: "INV-1042", customer: "Acme Inc.", amount: "$1,200.00" },
  { id: "INV-1043", customer: "Globex", amount: "$860.00" },
  { id: "INV-1044", customer: "Initech", amount: "$2,450.00" },
  { id: "INV-1045", customer: "Umbrella", amount: "$640.00" },
  { id: "INV-1046", customer: "Hooli", amount: "$3,100.00" },
];

function NavGroup({ label, items }: { label: string; items: typeof PLATFORM }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map(({ label: item, icon: Icon }) => (
          <SidebarMenuItem key={item}>
            <SidebarMenuButton
              isActive={item === "Invoices"}
              tooltip={item}
              render={<a href={`#${item.toLowerCase()}`} />}
            >
              <Icon />
              <span>{item}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export default function SidebarDemo() {
  return (
    <SidebarProvider style={styles.frame}>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Acme Inc.">
                <span aria-hidden {...stylex.props(styles.logo)}>
                  A
                </span>
                <span {...stylex.props(styles.workspace)}>Acme Inc.</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavGroup label="Platform" items={PLATFORM} />
          <NavGroup label="Account" items={ACCOUNT} />
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Ada Lovelace">
                <Avatar.Root size="sm" style={styles.avatar}>
                  <Avatar.Fallback>AL</Avatar.Fallback>
                </Avatar.Root>
                <span>Ada Lovelace</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset style={styles.inset}>
        <header {...stylex.props(styles.header)}>
          <SidebarTrigger />
          <Separator orientation="vertical" style={styles.divider} />
          <span {...stylex.props(styles.title)}>Invoices</span>
        </header>
        <div {...stylex.props(styles.body)}>
          <div {...stylex.props(styles.stats)}>
            {STATS.map((stat) => (
              <div key={stat.label} {...stylex.props(styles.stat)}>
                <span {...stylex.props(styles.muted)}>{stat.label}</span>
                <span {...stylex.props(styles.value)}>{stat.value}</span>
              </div>
            ))}
          </div>
          <ul {...stylex.props(styles.list)}>
            {RECENT.map((invoice) => (
              <li key={invoice.id} {...stylex.props(styles.row)}>
                <span>{invoice.customer}</span>
                <span {...stylex.props(styles.muted)}>{invoice.id}</span>
                <span {...stylex.props(styles.amount)}>{invoice.amount}</span>
              </li>
            ))}
          </ul>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

const styles = stylex.create({
  frame: {
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    minHeight: 0,
    overflow: "hidden",
    height: "30rem",
  },
  logo: {
    borderRadius: radius.sm,
    alignItems: "center",
    backgroundColor: colors.primary,
    color: colors.primaryForeground,
    display: "inline-flex",
    flexShrink: 0,
    fontSize: typography.fontSizeXs,
    fontWeight: typography.fontWeightSemibold,
    justifyContent: "center",
    // Centered in the button like an icon when the sidebar collapses to icons.
    marginInline: "-0.1875rem",
    height: "1.25rem",
    width: "1.25rem",
  },
  workspace: {
    fontWeight: typography.fontWeightSemibold,
  },
  avatar: {
    fontSize: "0.625rem",
    marginInline: "-0.1875rem",
    height: "1.25rem",
    width: "1.25rem",
  },
  inset: {
    overflowY: "auto",
  },
  header: {
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
    gap: spacing["2"],
    paddingInline: spacing["3"],
    alignItems: "center",
    display: "flex",
    flexShrink: 0,
    height: "3rem",
  },
  divider: {
    marginBlock: spacing["3"],
  },
  title: {
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
  },
  body: {
    padding: spacing["4"],
    gap: spacing["4"],
    display: "flex",
    flexDirection: "column",
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
  },
  stats: {
    gap: spacing["3"],
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(8rem, 1fr))",
  },
  stat: {
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    gap: spacing["1"],
    padding: spacing["3"],
    display: "flex",
    flexDirection: "column",
  },
  value: {
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightSemibold,
    lineHeight: typography.lineHeightLg,
  },
  muted: {
    color: colors.mutedForeground,
  },
  list: {
    margin: 0,
    padding: 0,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    listStyle: "none",
  },
  row: {
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: {
      default: 1,
      ":first-child": 0,
    },
    gap: spacing["3"],
    paddingBlock: spacing["2.5"],
    paddingInline: spacing["3"],
    display: "grid",
    gridTemplateColumns: "1fr auto auto",
  },
  amount: {
    fontVariantNumeric: "tabular-nums",
    minWidth: "5.5rem",
    textAlign: "end",
  },
});
