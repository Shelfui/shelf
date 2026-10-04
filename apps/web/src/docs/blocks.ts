export interface BlockCategory {
  slug: string;
  title: string;
}

export const blockCategories: BlockCategory[] = [
  { slug: "dashboard", title: "Dashboard" },
  { slug: "charts", title: "Charts" },
  { slug: "sidebar", title: "Sidebar" },
  { slug: "authentication", title: "Authentication" },
  { slug: "settings", title: "Settings" },
  { slug: "tables", title: "Tables" },
  { slug: "chat", title: "Chat" },
];

export interface BlockDoc {
  name: string;
  title: string;
  description: string;
  categories: string[];
  /** Shown on the blocks landing page. */
  featured?: boolean;
  /** Preview height in pixels. */
  height: number;
  /** The block is a whole page, edge to edge, so the preview adds no padding. */
  fill?: boolean;
  /** A narrow block, such as a form card, shown in the middle of the preview. */
  centered?: boolean;
}

export const blocks: BlockDoc[] = [
  {
    name: "chat",
    title: "Chat",
    description:
      "A complete chat: your message scrolls to the top and the reply streams in beneath it, with a message box, attachments, send that becomes stop, and regenerate and edit.",
    categories: ["chat"],
    featured: true,
    height: 640,
    fill: true,
  },
  {
    name: "dashboard-shell",
    title: "Dashboard Shell",
    description:
      "An app shell with pinned and recent items, a ⌘K command palette, and an account menu.",
    categories: ["dashboard", "sidebar"],
    featured: true,
    height: 800,
    fill: true,
  },
  {
    name: "dashboard-overview",
    title: "Dashboard Overview",
    description:
      "Key figures, a revenue chart, recent invoices, and goals, laid out for the top of a dashboard.",
    categories: ["dashboard"],
    height: 800,
  },
  {
    name: "analytics-dashboard",
    title: "Analytics Dashboard",
    description:
      "Figures with sparklines, revenue over time, orders by channel, and a heatmap of when customers buy.",
    categories: ["dashboard", "charts"],
    featured: true,
    height: 1100,
  },
  {
    name: "chart-card",
    title: "Chart Card",
    description:
      "A headline figure, its change, a date range switch, and an area chart in one card.",
    categories: ["charts"],
    height: 520,
    centered: true,
  },
  {
    name: "sidebar-nested",
    title: "Nested Sidebar",
    description:
      "A sidebar with search and collapsible sections that become menus when collapsed to icons.",
    categories: ["sidebar"],
    featured: true,
    height: 800,
    fill: true,
  },
  {
    name: "login-form",
    title: "Login Form",
    description: "A sign-in card with email and password fields, validation, and SSO.",
    categories: ["authentication"],
    featured: true,
    height: 640,
    centered: true,
  },
  {
    name: "login-split",
    title: "Split Login",
    description: "A sign-in page with a brand panel beside the form on wider screens.",
    categories: ["authentication"],
    featured: true,
    height: 720,
    fill: true,
  },
  {
    name: "signup-form",
    title: "Signup Form",
    description: "An account form with name, email, a checked password length, and terms.",
    categories: ["authentication"],
    height: 720,
    centered: true,
  },
  {
    name: "otp-verification",
    title: "OTP Verification",
    description: "A one-time code step with a six digit input and a resend link.",
    categories: ["authentication"],
    height: 520,
    centered: true,
  },
  {
    name: "settings-section",
    title: "Settings Section",
    description: "A profile section with text fields, a notification switch, Save, and Cancel.",
    categories: ["settings"],
    height: 600,
  },
  {
    name: "invoices-table",
    title: "Invoices Table",
    description:
      "An invoices list with status tabs, search, bulk actions on selected rows, and a running total.",
    categories: ["tables"],
    featured: true,
    height: 720,
  },
];
