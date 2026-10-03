"use client";

import * as stylex from "@stylexjs/stylex";
import { type ComponentType, type ReactNode, useRef, useState } from "react";
import * as Breadcrumb from "@/components/ui/breadcrumb";
import * as Collapsible from "@/components/ui/collapsible";
import * as DropdownMenu from "@/components/ui/dropdown-menu";
import {
  ChevronRightIcon,
  FileTextIcon,
  HouseIcon,
  InboxIcon,
  type IconProps,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
} from "@/components/ui/icons";
import * as InputGroup from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
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
  useSidebar,
} from "@/components/ui/sidebar";
import { media } from "@/styles/shelf/conditions.stylex";
import { colors, motion, radius, spacing, typography } from "@/styles/shelf/tokens.stylex";

interface NavItem {
  label: string;
  icon: ComponentType<IconProps>;
  href?: string;
  items?: { label: string; href: string }[];
}

const NAV: NavItem[] = [
  { label: "Home", icon: HouseIcon, href: "#home" },
  { label: "Inbox", icon: InboxIcon, href: "#inbox" },
  {
    label: "Invoices",
    icon: FileTextIcon,
    items: [
      { label: "All invoices", href: "#invoices" },
      { label: "Drafts", href: "#drafts" },
      { label: "Recurring", href: "#recurring" },
    ],
  },
  {
    label: "Customers",
    icon: UsersIcon,
    items: [
      { label: "Companies", href: "#companies" },
      { label: "Contacts", href: "#contacts" },
    ],
  },
  {
    label: "Settings",
    icon: SettingsIcon,
    items: [
      { label: "General", href: "#general" },
      { label: "Team", href: "#team" },
      { label: "Billing", href: "#billing" },
    ],
  },
];

export type SidebarNestedProps = Pick<SidebarProviderProps, "defaultOpen" | "style"> & {
  /** The current page, marked in the navigation and shown in the header. */
  page: string;
  children: ReactNode;
};

/**
 * An app shell whose sidebar sections expand into sub-pages, with search in the header.
 * The section holding the current page starts open. Collapsed to icons, each section
 * opens its sub-pages in a menu.
 */
export function SidebarNested({ page, defaultOpen, style, children }: SidebarNestedProps) {
  const section = NAV.find((item) => item.items?.some((sub) => sub.label === page));

  return (
    <SidebarProvider defaultOpen={defaultOpen} style={style}>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div {...stylex.props(styles.brand)}>
            <span aria-hidden {...stylex.props(styles.logo)}>
              A
            </span>
            <span {...stylex.props(styles.brandName)}>Acme Inc.</span>
          </div>
          <SidebarSearch />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarMenu>
              {NAV.map((item) => (
                <NavEntry key={item.label} item={item} page={page} />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset style={styles.inset}>
        <header {...stylex.props(styles.header)}>
          <SidebarTrigger />
          <Separator orientation="vertical" style={styles.divider} />
          <Breadcrumb.Root>
            <Breadcrumb.List>
              {section?.items && (
                <>
                  <Breadcrumb.Item>
                    <Breadcrumb.Link href={section.items[0]?.href}>{section.label}</Breadcrumb.Link>
                  </Breadcrumb.Item>
                  <Breadcrumb.Separator />
                </>
              )}
              <Breadcrumb.Item>
                <Breadcrumb.Page>{page}</Breadcrumb.Page>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb.Root>
        </header>
        <div {...stylex.props(styles.body)}>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function useIconOnly() {
  const { open, isMobile } = useSidebar();
  return !open && !isMobile;
}

/** A search field; collapsed to icons, a button that expands the sidebar and focuses it. */
function SidebarSearch() {
  const { setOpen } = useSidebar();
  const iconOnly = useIconOnly();
  const input = useRef<HTMLInputElement>(null);

  if (iconOnly) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip="Search"
            onClick={() => {
              setOpen(true);
              requestAnimationFrame(() => input.current?.focus());
            }}
          >
            <SearchIcon />
            <span>Search</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <div role="search">
      <InputGroup.Root>
        <InputGroup.Addon>
          <SearchIcon />
        </InputGroup.Addon>
        <InputGroup.Input ref={input} type="search" aria-label="Search" placeholder="Search" />
      </InputGroup.Root>
    </div>
  );
}

function NavEntry({ item, page }: { item: NavItem; page: string }) {
  const { label, icon: Icon, href, items } = item;
  const current = items?.some((sub) => sub.label === page) ?? false;
  const [open, setOpen] = useState(current);
  const iconOnly = useIconOnly();

  if (!items) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton isActive={label === page} tooltip={label} render={<a href={href} />}>
          <Icon />
          <span>{label}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  if (iconOnly) {
    return (
      <SidebarMenuItem>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger
            render={<SidebarMenuButton isActive={current} aria-current={current || undefined} />}
          >
            <Icon />
            <span>{label}</span>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content side="inline-end" align="start">
            <DropdownMenu.Group>
              <DropdownMenu.Label>{label}</DropdownMenu.Label>
              {items.map((sub) => (
                <DropdownMenu.LinkItem
                  key={sub.label}
                  href={sub.href}
                  aria-current={sub.label === page ? "page" : undefined}
                >
                  {sub.label}
                </DropdownMenu.LinkItem>
              ))}
            </DropdownMenu.Group>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <Collapsible.Root open={open} onOpenChange={setOpen}>
        <Collapsible.Trigger render={<SidebarMenuButton style={styles.groupButton} />}>
          <Icon />
          <span>{label}</span>
          <ChevronRightIcon {...stylex.props(styles.chevron, open && styles.chevronOpen)} />
        </Collapsible.Trigger>
        <Collapsible.Panel>
          <ul {...stylex.props(styles.sub)}>
            {items.map((sub) => (
              <li key={sub.label}>
                <a
                  href={sub.href}
                  aria-current={sub.label === page ? "page" : undefined}
                  {...stylex.props(styles.subLink, sub.label === page && styles.subLinkActive)}
                >
                  {sub.label}
                </a>
              </li>
            ))}
          </ul>
        </Collapsible.Panel>
      </Collapsible.Root>
    </SidebarMenuItem>
  );
}

const styles = stylex.create({
  brand: {
    gap: spacing["2"],
    paddingInline: spacing["2"],
    alignItems: "center",
    display: "flex",
    fontWeight: typography.fontWeightSemibold,
    height: "2rem",
  },
  brandName: {
    overflow: "hidden",
    whiteSpace: "nowrap",
  },
  logo: {
    borderRadius: radius.sm,
    alignItems: "center",
    backgroundColor: colors.primary,
    color: colors.primaryForeground,
    display: "inline-flex",
    fontSize: typography.fontSizeXs,
    justifyContent: "center",
    height: "1.25rem",
    width: "1.25rem",
  },
  groupButton: {
    gridTemplateColumns: "max-content minmax(0, 1fr) max-content",
  },
  chevron: {
    color: colors.mutedForeground,
    transitionDuration: {
      default: motion.durationFast,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "transform",
  },
  chevronOpen: {
    transform: "rotate(90deg)",
  },
  sub: {
    margin: 0,
    gap: 1,
    listStyle: "none",
    paddingBlock: spacing["1"],
    borderInlineStartColor: colors.border,
    borderInlineStartStyle: "solid",
    borderInlineStartWidth: 1,
    display: "grid",
    marginInlineStart: spacing["4"],
    paddingInlineStart: spacing["2"],
  },
  subLink: {
    borderRadius: radius.md,
    outline: "none",
    paddingInline: spacing["2"],
    textDecoration: "none",
    alignItems: "center",
    backgroundColor: {
      default: "transparent",
      ":hover": {
        default: null,
        [media.hover]: colors.accent,
      },
    },
    boxShadow: {
      default: null,
      ":focus-visible": `0 0 0 2px ${colors.ring}`,
    },
    color: colors.mutedForeground,
    display: "flex",
    height: "1.75rem",
  },
  subLinkActive: {
    backgroundColor: colors.accent,
    color: colors.accentForeground,
    fontWeight: typography.fontWeightMedium,
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
  body: {
    padding: spacing["4"],
    gap: spacing["4"],
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
  },
});
