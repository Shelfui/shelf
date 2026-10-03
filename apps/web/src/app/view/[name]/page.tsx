import * as stylex from "@stylexjs/stylex";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { blockDemos } from "@/demos/blocks";
import { blocks } from "@/docs/blocks";
import { spacing } from "@/styles/shelf/tokens.stylex";

export const dynamicParams = false;

export function generateStaticParams() {
  return blocks.map((block) => ({ name: block.name }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  const block = blocks.find((item) => item.name === name);
  return { title: block?.title, robots: { index: false } };
}

export default async function BlockView({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const block = blocks.find((item) => item.name === name);
  const Demo = blockDemos[name];
  if (!block || !Demo) notFound();

  if (block.fill) return <Demo />;
  return (
    <main {...stylex.props(styles.page, block.centered && styles.centered)}>
      <Demo />
    </main>
  );
}

const styles = stylex.create({
  page: {
    display: "grid",
    minHeight: "100svh",
    padding: { default: spacing["4"], "@media (min-width: 48rem)": spacing["6"] },
  },
  centered: {
    alignContent: "center",
    justifyItems: "center",
  },
});
