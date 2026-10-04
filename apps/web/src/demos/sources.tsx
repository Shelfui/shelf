import { Sources } from "@/components/ui/sources";

export default function SourcesDemo() {
  return (
    <Sources
      sources={[
        { type: "source-url", sourceId: "a", url: "https://example.com/a", title: "Annual report" },
        { type: "source-url", sourceId: "b", url: "https://example.org/b", title: "Press release" },
      ]}
    />
  );
}
