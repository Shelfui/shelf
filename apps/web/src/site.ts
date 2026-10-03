const lead =
  "Start with shared components, then make them yours. Shelf puts the source in every product and tracks every copy, so teams and agents move fast without leaving the system behind.";

export const siteConfig = {
  name: "Shelf",
  lead,
  description: `The design system every product owns. ${lead}`,
  url:
    process.env["SITE_URL"] ??
    (process.env.NODE_ENV === "production" ? "https://shelfui.dev" : "http://localhost:3000"),
  /** The Shelf Registry, built from this repo by .github/workflows/registry.yml. */
  registryUrl: process.env["REGISTRY_URL"] ?? "https://registry.shelfui.dev/",
};
