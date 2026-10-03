import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// ImageResponse can't read StyleX. These are the light values of background, foreground,
// mutedForeground, and border in registry/foundations/tokens.stylex.ts.
const colors = {
  background: "#ffffff",
  foreground: "#0a0a0a",
  mutedForeground: "#666666",
  border: "#eaeaea",
};

async function font(file: string): Promise<Buffer> {
  return readFile(path.join(process.cwd(), "src/assets/fonts", file));
}

/** The text of a metadata title, which is a string or an object with a default. */
function textOf(title: Metadata["title"]): string {
  if (typeof title === "string") return title;
  if (title && "absolute" in title && title.absolute) return title.absolute;
  if (title && "default" in title) return title.default;
  return "Shelf";
}

/** The image for a page, from the title and description in its metadata. */
export function ogImage(metadata: Metadata): Promise<ImageResponse> {
  return render(textOf(metadata.title));
}

export async function render(title: string): Promise<ImageResponse> {
  const [regular, medium] = await Promise.all([
    font("Geist-Regular.ttf"),
    font("Geist-Medium.ttf"),
  ]);
  return new ImageResponse(
    <div
      style={{
        background: colors.background,
        border: `1px solid ${colors.border}`,
        color: colors.foreground,
        display: "flex",
        flexDirection: "column",
        fontFamily: "Geist",
        height: "100%",
        justifyContent: "space-between",
        padding: 88,
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: title.length > 40 ? 104 : 128,
          fontWeight: 500,
          letterSpacing: "-0.04em",
          lineClamp: 4,
          lineHeight: 1.02,
          maxWidth: 1000,
        }}
      >
        {title}
      </div>
      <div style={{ alignItems: "center", display: "flex", gap: 16 }}>
        <svg
          width="48"
          height="48"
          viewBox="0 0 32 32"
          fill="none"
          stroke={colors.foreground}
          strokeWidth="1.5"
          strokeLinecap="square"
        >
          <rect x="4" y="4" width="24" height="24" />
          <path d="M4 16H28" />
          <path d="M9 16V9" />
          <path d="M12.5 16V9" />
          <path d="M16 16L19.88 9.35" strokeLinecap="butt" />
          <path d="M19.5 28V21" />
          <path d="M23 28V21" />
        </svg>
        <div style={{ fontSize: 36, fontWeight: 500, letterSpacing: "-0.03em" }}>Shelf</div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Geist", data: regular, weight: 400, style: "normal" },
        { name: "Geist", data: medium, weight: 500, style: "normal" },
      ],
    },
  );
}
