const lead =
  "Every team ships UI faster than your design system can follow. Agents too. Shelf puts one registry in every product as plain source, and tracks every change.";

export const siteConfig = {
  name: "Shelf",
  lead,
  description: `The interface system your company builds from. ${lead}`,
  url:
    process.env["SITE_URL"] ??
    (process.env.NODE_ENV === "production" ? "https://shelfui.dev" : "http://localhost:3000"),
  /** The Shelf Registry, built from this repo by .github/workflows/registry.yml. */
  registryUrl: process.env["REGISTRY_URL"] ?? "https://registry.shelfui.dev/",
  repoUrl: "https://github.com/Shelfui/shelf",
};
