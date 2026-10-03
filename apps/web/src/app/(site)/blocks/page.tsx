import type { Metadata } from "next";
import { BlockList } from "@/components/site/block-list";
import { blocks } from "@/docs/blocks";

export const metadata: Metadata = {
  title: "Blocks",
  description: "Finished pieces of a page, composed from Shelf components and one command away.",
  alternates: { canonical: "/blocks" },
};

export default function FeaturedBlocks() {
  return <BlockList blocks={blocks.filter((block) => block.featured)} />;
}
