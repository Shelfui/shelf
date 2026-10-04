import { CopyButton } from "@/components/ui/copy-button";

export default function CopyButtonDemo() {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <CopyButton text="bunx shelf add button" />
      <CopyButton text="bunx shelf add button" showLabel />
    </div>
  );
}
