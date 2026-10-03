"use client";

import * as stylex from "@stylexjs/stylex";
import { buttonStyles } from "@/components/ui/button";

export default function ButtonAsLink() {
  return (
    <a href="#invoices" {...stylex.props(buttonStyles("outline"))}>
      View invoices
    </a>
  );
}
