import { contentType, ogImage, size } from "@/lib/og";
import { metadata } from "./page";

export { contentType, size };

export default function Image() {
  return ogImage(metadata);
}
