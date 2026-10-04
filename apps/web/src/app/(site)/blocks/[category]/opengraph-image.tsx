import { blockCategories } from "@/docs/blocks";
import { contentType, render, size } from "@/lib/og";

export { contentType, size };

export function generateStaticParams() {
  return blockCategories.map((category) => ({ category: category.slug }));
}

export default async function Image({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const match = blockCategories.find((item) => item.slug === category);
  return render(match ? (match.pageTitle ?? `${match.title} blocks`) : "Blocks");
}
