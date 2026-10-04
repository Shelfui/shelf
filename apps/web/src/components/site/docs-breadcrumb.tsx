"use client";

import { Fragment } from "react";
import { usePathname } from "next/navigation";
import * as Breadcrumb from "@/components/ui/breadcrumb";

/**
 * Docs / Section / Page, taken from the URL. The last crumb is the page's own title; earlier
 * segments are capitalized and link to their index. Renders nothing outside `/docs/*`.
 */
export function DocsBreadcrumb({ title }: { title: string }) {
  const segments = usePathname().split("/").filter(Boolean);
  if (segments[0] !== "docs" || segments.length < 2) return null;

  const parents = segments.slice(0, -1).map((segment, index) => ({
    title: segment.charAt(0).toUpperCase() + segment.slice(1),
    href: `/${segments.slice(0, index + 1).join("/")}`,
  }));

  return (
    <Breadcrumb.Root>
      <Breadcrumb.List>
        {parents.map((crumb) => (
          <Fragment key={crumb.href}>
            <Breadcrumb.Item>
              <Breadcrumb.Link href={crumb.href}>{crumb.title}</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
          </Fragment>
        ))}
        <Breadcrumb.Item>
          <Breadcrumb.Page>{title}</Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb.Root>
  );
}
