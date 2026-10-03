"use client";

import * as stylex from "@stylexjs/stylex";
import { type ComponentType, type ReactNode, useEffect, useState } from "react";
import * as Avatar from "../../components/avatar/avatar";
import * as Breadcrumb from "../../components/breadcrumb/breadcrumb";
import { Button } from "../../components/button/button";
import * as Command from "../../components/command/command";
import * as DropdownMenu from "../../components/dropdown-menu/dropdown-menu";
import {
  CircleAlertIcon,
  FileTextIcon,
  HouseIcon,
  InboxIcon,
  type IconProps,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
} from "../../components/icons/icons";
import { Kbd } from "../../components/kbd/kbd";
import { Separator } from "../../components/separator/separator";
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
  type SidebarProviderProps,
  SidebarTrigger,
} from "../../components/sidebar/sidebar";
import { colors, radius, spacing, typography } from "../../foundations/tokens.stylex";

interface Link {
  label: string;
  href: string;
  icon?: ComponentType<IconProps>;
  count?: number;
}

const NAV: Link[] = [
  { label: "Home", href: "#home", icon: HouseIcon },
  { label: "Inbox", href: "#inbox", icon: InboxIcon, count: 3 },
  { label: "Invoices", href: "#invoices", icon: FileTextIcon, count: 8 },
  { label: "Customers", href: "#customers", icon: UsersIcon },
];

const PINNED: Link[] = [
  { label: "Overdue", href: "#overdue", icon: CircleAlertIcon, count: 2 },
  { label: "Drafts", href: "#drafts", icon: FileTextIcon, count: 1 },
];

const RECENT: Link[] = [
  { label: "INV-1049 · Globex", href: "#inv-1049" },
  { label: "INV-1048 · Wayne Enterprises", href: "#inv-1048" },
  { label: "Stark Industries", href: "#stark-industries" },
];

const SETTINGS: Link = { label: "Settings", href: "#settings", icon: SettingsIcon };

const PALETTE = [
  { value: "Jump to", items: [...NAV, SETTINGS].map(toItem) },
  { value: "Recent", items: RECENT.map(toItem) },
];

type PaletteItem = { value: string; label: string };

function toItem(link: Link): PaletteItem {
  return { value: link.href, label: link.label };
}

export type DashboardShellProps = Pick<SidebarProviderProps, "defaultOpen" | "style"> & {
  /** The current page: marked in the navigation and shown in the breadcrumb. */
  page: string;
  children: ReactNode;
};

/**
 * An app shell: a sidebar with navigation, pinned views, and recent items beside a header
 * with the breadcrumb, a search that opens a command palette (also on ⌘K or Ctrl+K), and
 * the account menu. The page renders as `children`.
 * It fills the viewport; give it a fixed `height` and `minHeight: 0` to put it in a container.
 */
export function DashboardShell({ page, defaultOpen, style, children }: DashboardShellProps) {
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setSearching((open) => !open);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <SidebarProvider defaultOpen={defaultOpen} style={style}>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Acme" render={<a href="#home" />}>
                <span aria-hidden {...stylex.props(styles.logo)}>
                  A
                </span>
                <span {...stylex.props(styles.brand)}>Acme</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavGroup links={NAV} page={page} />
          <NavGroup label="Pinned" links={PINNED} page={page} />
          <NavGroup label="Recent" links={RECENT} page={page} style={styles.recent} />
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <NavItem link={SETTINGS} page={page} />
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset style={styles.inset}>
        <header {...stylex.props(styles.header)}>
          <SidebarTrigger />
          <Separator orientation="vertical" style={styles.divider} />
          <Breadcrumb.Root style={styles.breadcrumb}>
            <Breadcrumb.List style={styles.breadcrumbList}>
              <Breadcrumb.Item>
                <Breadcrumb.Link href="#home">Acme</Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <Breadcrumb.Page>{page}</Breadcrumb.Page>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb.Root>
          <div {...stylex.props(styles.actions)}>
            <Button
              variant="outline"
              size="sm"
              aria-label="Search"
              aria-keyshortcuts="Meta+K Control+K"
              style={[styles.searchWide, styles.searchTrigger]}
              onClick={() => setSearching(true)}
            >
              <SearchIcon />
              <span {...stylex.props(styles.searchLabel)}>Search or jump to…</span>
              <Kbd aria-hidden>⌘K</Kbd>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Search"
              style={styles.searchNarrow}
              onClick={() => setSearching(true)}
            >
              <SearchIcon />
            </Button>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger
                render={<Button variant="ghost" size="icon-sm" aria-label="Account" />}
              >
                <Avatar.Root size="sm">
                  <Avatar.Fallback>AL</Avatar.Fallback>
                </Avatar.Root>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="end">
                <DropdownMenu.Group>
                  <DropdownMenu.Label>
                    <span {...stylex.props(styles.userName)}>Ada Lovelace</span>
                    <span {...stylex.props(styles.userEmail)}>ada@example.com</span>
                  </DropdownMenu.Label>
                </DropdownMenu.Group>
                <DropdownMenu.Separator />
                <DropdownMenu.Item>Profile</DropdownMenu.Item>
                <DropdownMenu.Item>Billing</DropdownMenu.Item>
                <DropdownMenu.Separator />
                <DropdownMenu.Item>Log out</DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        </header>
        <div {...stylex.props(styles.body)}>{children}</div>
      </SidebarInset>
      <Command.Dialog
        open={searching}
        onOpenChange={setSearching}
        title="Search Acme"
        description="Jump to a page or a recent item."
      >
        <Command.Root items={PALETTE}>
          <Command.Input aria-label="Search" placeholder="Search or jump to…" />
          <Command.List aria-label="Results">
            {(group: (typeof PALETTE)[number]) => (
              <Command.Group key={group.value} items={group.items}>
                <Command.GroupLabel>{group.value}</Command.GroupLabel>
                <Command.Collection>
                  {(item: PaletteItem) => (
                    <Command.Item
                      key={item.value}
                      value={item}
                      onClick={() => {
                        setSearching(false);
                        window.location.hash = item.value;
                      }}
                    >
                      {item.label}
                    </Command.Item>
                  )}
                </Command.Collection>
              </Command.Group>
            )}
          </Command.List>
          <Command.Empty>No results.</Command.Empty>
        </Command.Root>
      </Command.Dialog>
    </SidebarProvider>
  );
}

function NavGroup({
  label,
  links,
  page,
  style,
}: {
  label?: string;
  links: Link[];
  page: string;
  style?: stylex.StaticStyles;
}) {
  return (
    <SidebarGroup style={style}>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarMenu>
        {links.map((link) => (
          <NavItem key={link.href} link={link} page={page} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function NavItem({ link, page }: { link: Link; page: string }) {
  const { label, href, icon: Icon, count } = link;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={label === page}
        tooltip={label}
        render={<a href={href} />}
        style={count === undefined ? undefined : styles.withCount}
      >
        {Icon && <Icon />}
        <span {...stylex.props(styles.label)}>{label}</span>
        {count !== undefined && (
          <span aria-label={`${count} items`} {...stylex.props(styles.count)}>
            {count}
          </span>
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

const WIDE = "@media (width >= 48rem)";

const styles = stylex.create({
  logo: {
    borderRadius: radius.sm,
    // Centered in the button like an icon when the sidebar collapses to icons.
    marginInline: "-0.1875rem",
    alignItems: "center",
    backgroundColor: colors.primary,
    color: colors.primaryForeground,
    display: "inline-flex",
    flexShrink: 0,
    fontSize: typography.fontSizeXs,
    fontWeight: typography.fontWeightSemibold,
    justifyContent: "center",
    height: "1.25rem",
    width: "1.25rem",
  },
  brand: {
    fontWeight: typography.fontWeightSemibold,
  },
  recent: {
    display: {
      default: null,
      [stylex.when.ancestor("[data-collapsible=icon][data-state=collapsed]")]: "none",
    },
  },
  withCount: {
    gridTemplateColumns: "max-content minmax(0, 1fr) max-content",
  },
  label: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  count: {
    color: colors.mutedForeground,
    fontSize: typography.fontSizeXs,
    fontVariantNumeric: "tabular-nums",
  },
  inset: {
    overflowY: "auto",
  },
  header: {
    gap: spacing["2"],
    paddingInline: spacing["3"],
    alignItems: "center",
    display: "flex",
    flexShrink: 0,
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
    height: "3rem",
  },
  divider: {
    marginBlock: spacing["3"],
  },
  breadcrumb: {
    minWidth: 0,
  },
  breadcrumbList: {
    flexWrap: "nowrap",
    whiteSpace: "nowrap",
  },
  actions: {
    gap: spacing["1"],
    alignItems: "center",
    display: "flex",
    marginInlineStart: "auto",
  },
  searchWide: {
    display: { [WIDE]: "inline-flex", default: "none" },
  },
  searchTrigger: {
    color: colors.mutedForeground,
    justifyContent: "flex-start",
    marginInlineEnd: spacing["1"],
    width: "16rem",
  },
  searchLabel: {
    flexGrow: 1,
    textAlign: "start",
  },
  searchNarrow: {
    display: { [WIDE]: "none", default: "inline-flex" },
  },
  userName: {
    color: colors.foreground,
    display: "block",
    fontWeight: typography.fontWeightMedium,
  },
  userEmail: {
    display: "block",
    fontWeight: typography.fontWeightRegular,
  },
  body: {
    padding: spacing["4"],
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
  },
});
