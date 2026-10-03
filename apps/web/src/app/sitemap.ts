import type { MetadataRoute } from "next";
import { blockCategories } from "@/docs/blocks";
import { components } from "@/docs/components";
import { docGroups } from "@/docs/pages";
import { siteConfig } from "@/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "",
    "/registry",
    ...docGroups.flatMap((group) => group.links.map((link) => link.href)),
  ];
  return [
    ...pages.map((page) => ({ url: `${siteConfig.url}${page}` })),
    ...components.map((component) => ({
      url: `${siteConfig.url}/docs/components/${component.name}`,
    })),
    ...blockCategories.map((category) => ({ url: `${siteConfig.url}/blocks/${category.slug}` })),
  ];
}
