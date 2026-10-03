import { contentType, render, size } from "@/lib/og";
import { siteConfig } from "@/site";

export { contentType, size };

export default function Image() {
  return render("The design system every product owns", siteConfig.lead);
}
