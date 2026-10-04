"use client";

import * as stylex from "@stylexjs/stylex";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { media } from "@/styles/shelf/conditions.stylex";
import { colors, motion, spacing, typography } from "@/styles/shelf/tokens.stylex";
import { site } from "@/styles/site.stylex";

interface Heading {
  id: string;
  title: string;
}

/**
 * "On this page": the `h2`s of the current docs page, with the one being read marked. Headings
 * are read from the rendered page, so TSX and Markdown pages work the same.
 */
export function DocsToc() {
  const pathname = usePathname();
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState<string>();

  useEffect(() => {
    const elements = [...document.querySelectorAll<HTMLElement>("main h2[id]")];
    setHeadings(elements.map((element) => ({ id: element.id, title: element.textContent ?? "" })));
    setActive(elements[0]?.id);

    // The active heading is the last one that has scrolled above the top quarter of the viewport.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "0px 0px -75% 0px" },
    );
    for (const element of elements) observer.observe(element);
    return () => observer.disconnect();
  }, [pathname]);

  if (headings.length < 2) return <aside aria-hidden {...stylex.props(styles.aside)} />;

  return (
    <aside {...stylex.props(styles.aside)}>
      <nav aria-label="On this page" {...stylex.props(styles.nav)}>
        <h2 {...stylex.props(styles.title)}>On this page</h2>
        <ul {...stylex.props(styles.list)}>
          {headings.map((heading) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                aria-current={heading.id === active ? "location" : undefined}
                {...stylex.props(styles.link, heading.id === active && styles.active)}
              >
                {heading.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

const styles = stylex.create({
  aside: {
    display: { default: "none", "@media (min-width: 1280px)": "block" },
    flexShrink: 0,
    height: `calc(100dvh - ${site.headerHeight})`,
    position: "sticky",
    top: site.headerHeight,
    width: "13rem",
  },
  nav: {
    gap: spacing["3"],
    display: "grid",
    paddingTop: "5rem",
  },
  title: {
    color: colors.mutedForeground,
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightRegular,
    lineHeight: typography.lineHeightSm,
    margin: 0,
  },
  list: {
    borderInlineStartColor: colors.border,
    borderInlineStartStyle: "solid",
    borderInlineStartWidth: 1,
    display: "grid",
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  link: {
    color: {
      default: colors.mutedForeground,
      [media.hover]: { default: null, ":hover": colors.foreground },
    },
    display: "block",
    fontSize: typography.fontSizeBase,
    lineHeight: typography.lineHeightBase,
    marginInlineStart: -1,
    borderInlineStartColor: "transparent",
    borderInlineStartStyle: "solid",
    borderInlineStartWidth: 1,
    paddingBlock: spacing["1"],
    paddingInlineStart: spacing["3"],
    textDecoration: "none",
    transitionDuration: motion.durationFast,
    transitionProperty: "color, border-color",
  },
  active: {
    borderInlineStartColor: colors.foreground,
    color: colors.foreground,
  },
});
