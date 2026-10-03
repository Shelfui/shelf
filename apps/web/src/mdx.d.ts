declare module "*.mdx" {
  import type { Metadata } from "next";
  import type { ComponentType } from "react";

  /** Every docs page exports its metadata, which its opengraph-image reads. */
  export const metadata: Metadata;
  const Page: ComponentType;
  export default Page;
}
