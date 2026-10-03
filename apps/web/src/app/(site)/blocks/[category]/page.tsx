import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlockList } from "@/components/site/block-list";
import { blockCategories, blocks } from "@/docs/blocks";

export const dynamicParams = false;

export function generateStaticParams() {
  return blockCategories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const match = blockCategories.find((item) => item.slug === category);
  return {
    title: match ? `${match.title} blocks` : "Blocks",
    alternates: { canonical: `/blocks/${category}` },
  };
}

export default async function CategoryBlocks({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!blockCategories.some((item) => item.slug === category)) notFound();
  return <BlockList blocks={blocks.filter((block) => block.categories.includes(category))} />;
}
