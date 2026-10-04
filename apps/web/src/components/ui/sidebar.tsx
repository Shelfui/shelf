"use client";

import { useRender } from "@base-ui/react/use-render";
import * as stylex from "@stylexjs/stylex";
import {
  type ComponentProps,
  type ReactNode,
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { media } from "@/styles/shelf/conditions.stylex";
import {
  colors,
  motion,
  radius,
  sizes,
  spacing,
  typography,
} from "@/styles/shelf/tokens.stylex";
import { Button, type ButtonProps } from "./button";
import * as Drawer from "./drawer";
import { PanelLeftIcon } from "./icons";
import { Separator } from "./separator";
import * as Tooltip from "./tooltip";
import type { Styled } from "@/lib/shelf/utils";

const MOBILE_QUERY = "(width < 48rem)";
const WIDTH = "16rem";
const WIDTH_MOBILE = "18rem";
// Fits one icon button plus the group padding and the panel's 1px border.
const WIDTH_ICON = "calc(3rem + 1px)";

interface SidebarContextValue {
  /** The desktop sidebar is expanded. */
  open: boolean;
  setOpen: (open: boolean) => void;
  /** The mobile sheet is open. */
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  /** The viewport is narrower than 48rem, so the sidebar renders as a modal sheet. */
  isMobile: boolean;
  /** Toggles the sheet on mobile and the sidebar on desktop. */
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

/** Reads and controls the nearest `SidebarProvider`. */
export function useSidebar(): SidebarContextValue {
  const context = use(SidebarContext);
  if (!context) throw new Error("useSidebar must be used inside a SidebarProvider.");
  return context;
}

/** What parts inside a `Sidebar` need to know about it. */
const SidebarPanelContext = createContext<{ iconOnly: boolean; side: "left" | "right" }>({
  iconOnly: false,
  side: "left",
});

function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export type SidebarProviderProps = Styled<ComponentProps<"div">> & {
  /** Whether the desktop sidebar is expanded. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

/**
 * The app shell: a flex row holding a `Sidebar` and a `SidebarInset`. It fills at least the
 * viewport height; to put the shell in a container, give it a fixed `height` and `minHeight: 0`.
 * Cmd/Ctrl+B toggles the sidebar.
 *
 *   <SidebarProvider>
 *     <Sidebar collapsible="icon">
 *       <SidebarHeader>…</SidebarHeader>
 *       <SidebarContent>
 *         <SidebarGroup>
 *           <SidebarGroupLabel>Workspace</SidebarGroupLabel>
 *           <SidebarMenu>
 *             <SidebarMenuItem>
 *               <SidebarMenuButton isActive tooltip="Inbox" render={<a href="/inbox" />}>
 *                 <InboxIcon /> <span>Inbox</span>
 *               </SidebarMenuButton>
 *             </SidebarMenuItem>
 *           </SidebarMenu>
 *         </SidebarGroup>
 *       </SidebarContent>
 *       <SidebarFooter>…</SidebarFooter>
 *     </Sidebar>
 *     <SidebarInset>
 *       <header><SidebarTrigger /></header>
 *     </SidebarInset>
 *   </SidebarProvider>
 */
export function SidebarProvider({
  open: openProp,
  defaultOpen = true,
  onOpenChange,
  style,
  children,
  ...props
}: SidebarProviderProps) {
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const [openState, setOpenState] = useState(defaultOpen);
  const [openMobile, setOpenMobile] = useState(false);
  const open = openProp ?? openState;

  const setOpen = useCallback(
    (next: boolean) => {
      if (openProp === undefined) setOpenState(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange],
  );

  const toggleSidebar = useCallback(() => {
    if (isMobile) setOpenMobile((current) => !current);
    else setOpen(!open);
  }, [isMobile, open, setOpen]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "b" || !(event.metaKey || event.ctrlKey)) return;
      if (event.altKey || event.shiftKey) return;
      event.preventDefault();
      toggleSidebar();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleSidebar]);

  const context = useMemo(
    () => ({ open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar }),
    [open, setOpen, openMobile, isMobile, toggleSidebar],
  );

  return (
    <SidebarContext value={context}>
      <Tooltip.Provider>
        <div data-slot="sidebar-wrapper" {...props} {...stylex.props(styles.wrapper, style)}>
          {children}
        </div>
      </Tooltip.Provider>
    </SidebarContext>
  );
}

export type SidebarProps = Styled<ComponentProps<"div">> & {
  /** Which edge it sits on. Place a right sidebar after the `SidebarInset`. */
  side?: "left" | "right";
  /**
   * How it collapses on desktop: slide away (`offcanvas`), shrink to icons (`icon`),
   * or never (`none`). Below 48rem, collapsible sidebars become a modal sheet.
   */
  collapsible?: "offcanvas" | "icon" | "none";
};

/** The sidebar panel. It sticks to the top of the page and scrolls its own `SidebarContent`. */
export function Sidebar({
  side = "left",
  collapsible = "offcanvas",
  style,
  children,
  ...props
}: SidebarProps) {
  const { open, isMobile, openMobile, setOpenMobile } = useSidebar();
  const collapsed = collapsible !== "none" && !open;
  const iconOnly = collapsed && collapsible === "icon";
  const hidden = collapsed && collapsible === "offcanvas";
  const mobilePanel = useMemo(() => ({ iconOnly: false, side }), [side]);
  const desktopPanel = useMemo(() => ({ iconOnly, side }), [iconOnly, side]);

  if (isMobile && collapsible !== "none") {
    return (
      <SidebarPanelContext value={mobilePanel}>
        <Drawer.Root open={openMobile} onOpenChange={setOpenMobile} swipeDirection={side}>
          <Drawer.Content aria-label="Sidebar" style={styles.sheet}>
            <div
              data-slot="sidebar"
              data-mobile=""
              {...props}
              {...stylex.props(styles.sheetPanel, style)}
            >
              {children}
            </div>
          </Drawer.Content>
        </Drawer.Root>
      </SidebarPanelContext>
    );
  }

  return (
    <SidebarPanelContext value={desktopPanel}>
      <div
        data-slot="sidebar-gap"
        data-state={collapsed ? "collapsed" : "expanded"}
        data-collapsible={collapsible}
        data-side={side}
        {...stylex.props(
          styles.gap,
          side === "right" && styles.gapRight,
          iconOnly && styles.iconWidth,
          hidden && styles.gapHidden,
        )}
      >
        <div
          data-slot="sidebar"
          inert={hidden}
          {...props}
          {...stylex.props(
            styles.panel,
            side === "left" ? styles.panelLeft : styles.panelRight,
            iconOnly && styles.iconWidth,
            hidden && (side === "left" ? styles.panelHiddenLeft : styles.panelHiddenRight),
            style,
          )}
        >
          {children}
        </div>
      </div>
    </SidebarPanelContext>
  );
}

/** A ghost icon button that toggles the sidebar. */
export function SidebarTrigger({ style, onClick, ...props }: ButtonProps) {
  const { open, openMobile, isMobile, toggleSidebar } = useSidebar();

  return (
    <Button
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon-sm"
      aria-label="Toggle sidebar"
      aria-expanded={isMobile ? openMobile : open}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      style={[styles.trigger, style]}
    >
      <PanelLeftIcon />
    </Button>
  );
}

/** The main content beside the sidebar. */
export function SidebarInset({ style, ...props }: Styled<ComponentProps<"main">>) {
  return <main data-slot="sidebar-inset" {...props} {...stylex.props(styles.inset, style)} />;
}

export function SidebarHeader({ style, ...props }: Styled<ComponentProps<"div">>) {
  return <div data-slot="sidebar-header" {...props} {...stylex.props(styles.section, style)} />;
}

/** The scrolling middle of the sidebar, between header and footer. */
export function SidebarContent({ style, ...props }: Styled<ComponentProps<"div">>) {
  return <div data-slot="sidebar-content" {...props} {...stylex.props(styles.content, style)} />;
}

export function SidebarFooter({ style, ...props }: Styled<ComponentProps<"div">>) {
  return <div data-slot="sidebar-footer" {...props} {...stylex.props(styles.section, style)} />;
}

export function SidebarGroup({ style, ...props }: Styled<ComponentProps<"div">>) {
  return <div data-slot="sidebar-group" {...props} {...stylex.props(styles.group, style)} />;
}

/** A group heading. Hidden while the sidebar is collapsed to icons. */
export function SidebarGroupLabel({ style, ...props }: Styled<ComponentProps<"div">>) {
  const { iconOnly } = use(SidebarPanelContext);

  return (
    <div
      data-slot="sidebar-group-label"
      {...props}
      {...stylex.props(styles.groupLabel, iconOnly && styles.groupLabelHidden, style)}
    />
  );
}

export function SidebarMenu({ style, ...props }: Styled<ComponentProps<"ul">>) {
  return <ul data-slot="sidebar-menu" {...props} {...stylex.props(styles.menu, style)} />;
}

export function SidebarMenuItem({ style, ...props }: Styled<ComponentProps<"li">>) {
  return <li data-slot="sidebar-menu-item" {...props} {...stylex.props(styles.menuItem, style)} />;
}

export type SidebarMenuButtonProps = Styled<useRender.ComponentProps<"button">> & {
  /** Marks the current page, for sighted users and with `aria-current="page"`. */
  isActive?: boolean;
  /** Shown beside the button while the sidebar is collapsed to icons. */
  tooltip?: ReactNode;
};

/**
 * A row in a `SidebarMenu`: an icon and a label. Renders a `<button>`; for navigation,
 * pass `render={<a href="…" />}` or your router's link. Give it a `tooltip` in icon sidebars,
 * where the label is clipped.
 */
export function SidebarMenuButton({
  render,
  ref,
  isActive = false,
  tooltip,
  style,
  ...props
}: SidebarMenuButtonProps) {
  const { iconOnly, side } = use(SidebarPanelContext);

  const element = useRender({
    render,
    ref,
    defaultTagName: "button",
    props: {
      "data-slot": "sidebar-menu-button",
      type: render ? undefined : "button",
      "aria-current": isActive ? "page" : undefined,
      ...props,
      ...stylex.props(
        styles.menuButton,
        isActive && styles.menuButtonActive,
        iconOnly && styles.menuButtonIcon,
        style,
      ),
    },
  });

  if (tooltip === undefined) return element;

  return (
    <Tooltip.Root disabled={!iconOnly}>
      <Tooltip.Trigger render={element} />
      <Tooltip.Content side={side === "left" ? "right" : "left"}>{tooltip}</Tooltip.Content>
    </Tooltip.Root>
  );
}

export function SidebarSeparator({ style, ...props }: ComponentProps<typeof Separator>) {
  return <Separator data-slot="sidebar-separator" {...props} style={[styles.separator, style]} />;
}

const styles = stylex.create({
  wrapper: {
    display: "flex",
    minHeight: "100svh",
    width: "100%",
  },
  gap: {
    display: "flex",
    flexShrink: 0,
    position: "relative",
    transitionDuration: {
      default: motion.durationSlow,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "width",
    transitionTimingFunction: motion.easingStandard,
    overflowX: "clip",
    width: WIDTH,
  },
  gapRight: {
    justifyContent: "flex-end",
  },
  gapHidden: {
    width: 0,
  },
  panel: {
    fontSynthesis: "none",
    borderColor: colors.border,
    borderStyle: "solid",
    borderWidth: 0,
    backgroundColor: colors.background,
    boxSizing: "border-box",
    color: colors.foreground,
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
    position: "sticky",
    transitionDuration: {
      default: motion.durationSlow,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "width, transform",
    transitionTimingFunction: motion.easingStandard,
    // A full-page shell is as tall as the viewport; a shell in a container, as tall as it.
    height: "100svh",
    maxHeight: "100%",
    top: 0,
    width: WIDTH,
  },
  panelLeft: {
    borderInlineEndWidth: 1,
  },
  panelRight: {
    borderInlineStartWidth: 1,
  },
  panelHiddenLeft: {
    transform: "translateX(-100%)",
  },
  panelHiddenRight: {
    transform: "translateX(100%)",
  },
  iconWidth: {
    width: WIDTH_ICON,
  },
  sheet: {
    width: WIDTH_MOBILE,
  },
  sheetPanel: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
    minHeight: 0,
  },
  trigger: {
    backgroundColor: {
      default: "transparent",
      ":hover": {
        default: null,
        [media.hover]: colors.accent,
      },
    },
  },
  inset: {
    fontSynthesis: "none",
    backgroundColor: colors.background,
    color: colors.foreground,
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    fontFamily: typography.fontFamily,
    minWidth: 0,
  },
  section: {
    padding: spacing["2"],
    gap: spacing["2"],
    display: "flex",
    flexDirection: "column",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minHeight: 0,
    overflowX: "hidden",
    overflowY: "auto",
  },
  group: {
    padding: spacing["2"],
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  groupLabel: {
    overflow: "hidden",
    paddingInline: spacing["2"],
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexShrink: 0,
    fontSize: typography.fontSizeXs,
    fontWeight: typography.fontWeightMedium,
    lineHeight: typography.lineHeightXs,
    transitionDuration: {
      default: motion.durationSlow,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "height, opacity",
    transitionTimingFunction: motion.easingStandard,
    whiteSpace: "nowrap",
    height: sizes.controlDefault,
  },
  groupLabelHidden: {
    opacity: 0,
    height: 0,
  },
  menu: {
    margin: 0,
    padding: 0,
    gap: spacing["1"],
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  menuItem: {
    position: "relative",
  },
  menuButton: {
    fontSynthesis: "none",
    margin: 0,
    borderRadius: radius.md,
    borderWidth: 0,
    gap: spacing["2"],
    outline: "none",
    overflow: "hidden",
    // Centers a 1em icon in a square button once the label is clipped.
    paddingInline: `calc((${sizes.controlDefault} - 1em) / 2)`,
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
    boxSizing: "border-box",
    color: colors.foreground,
    cursor: "pointer",
    // Grid columns, unlike flex items, don't shrink, so icons keep their size when clipped.
    display: "grid",
    flexShrink: 0,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    gridAutoColumns: "max-content",
    gridAutoFlow: "column",
    justifyContent: "start",
    lineHeight: typography.lineHeightSm,
    textAlign: "start",
    transitionDuration: {
      default: motion.durationFast,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "width, background-color, box-shadow",
    transitionTimingFunction: motion.easingStandard,
    whiteSpace: "nowrap",
    height: sizes.controlDefault,
    width: "100%",
  },
  menuButtonActive: {
    backgroundColor: colors.accent,
    color: colors.accentForeground,
    fontWeight: typography.fontWeightMedium,
  },
  menuButtonIcon: {
    // Pushes the label fully past the clipped edge, padding included.
    columnGap: sizes.controlDefault,
    width: sizes.controlDefault,
  },
  separator: {
    marginInline: spacing["2"],
    width: "auto",
  },
});
