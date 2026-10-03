"use client";

import * as stylex from "@stylexjs/stylex";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import type { Styled } from "@/lib/shelf/utils";

/** A link that marks itself `aria-current="page"` on its page, or anywhere below it with `nested`. */
export function NavLink({
  href,
  nested = false,
  style,
  activeStyle,
  ...props
}: Styled<ComponentProps<typeof Link>> & {
  href: string;
  nested?: boolean;
  activeStyle?: stylex.StaticStyles;
}) {
  const pathname = usePathname();
  const active = nested ? pathname === href || pathname.startsWith(`${href}/`) : pathname === href;

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      {...props}
      {...stylex.props(style, active && activeStyle)}
    />
  );
}
