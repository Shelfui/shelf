import { Citation } from "@/components/ui/citation";

export default function CitationDemo() {
  return (
    <p>
      Revenue grew 12% last year.
      <Citation index={1} href="https://example.com/report" title="Annual report" />
    </p>
  );
}
