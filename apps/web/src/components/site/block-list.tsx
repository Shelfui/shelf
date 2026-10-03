import * as stylex from "@stylexjs/stylex";
import { installedFiles } from "@/docs/source";
import type { BlockDoc } from "@/docs/blocks";
import { spacing } from "@/styles/shelf/tokens.stylex";
import { site } from "@/styles/site.stylex";
import { BlockViewer } from "./block-viewer";
import { CodeBlock } from "./code-block";

export async function BlockList({ blocks }: { blocks: BlockDoc[] }) {
  const files = await Promise.all(blocks.map((block) => installedFiles(block.name)));

  return (
    <div {...stylex.props(styles.list)}>
      {blocks.map((block, index) => (
        <BlockViewer
          key={block.name}
          name={block.name}
          title={block.title}
          description={block.description}
          height={block.height}
          code={
            <div {...stylex.props(styles.files)}>
              {(files[index] ?? []).map((file) => (
                <CodeBlock key={file.path} code={file.code} title={file.path} maxHeight />
              ))}
            </div>
          }
        />
      ))}
    </div>
  );
}

const styles = stylex.create({
  list: {
    gap: { default: site.space12, "@media (min-width: 768px)": site.space24 },
    display: "grid",
  },
  files: {
    gap: spacing["4"],
    display: "grid",
  },
});
