import * as stylex from "@stylexjs/stylex";
import { colors, typography } from "@/styles/shelf/tokens.stylex";
import { screens, site } from "@/styles/site.stylex";

/** A two-tone heading: a strong line, then a muted line beneath it. */
export function Headline({
  as: Heading = "h2",
  size = "section",
  strong,
  muted,
  id,
  align = "start",
}: {
  as?: "h1" | "h2";
  size?: "display" | "section";
  strong: string;
  muted?: string;
  id?: string;
  align?: "start" | "center";
}) {
  return (
    <Heading
      id={id}
      {...stylex.props(
        styles.base,
        size === "display" ? styles.display : styles.section,
        align === "center" && styles.center,
      )}
    >
      {strong}
      {muted && (
        <>
          {" "}
          <span {...stylex.props(styles.muted)}>{muted}</span>
        </>
      )}
    </Heading>
  );
}

const styles = stylex.create({
  base: {
    margin: 0,
    color: colors.foreground,
    fontWeight: typography.fontWeightRegular,
    textWrap: "balance",
  },
  display: {
    fontSize: { default: "3rem", [screens.md]: "4.5rem" },
    letterSpacing: "-0.035em",
    lineHeight: 1,
    maxWidth: "20ch",
  },
  section: {
    fontSize: { default: site.fontSize3xl, [screens.md]: site.fontSize5xl },
    letterSpacing: "-0.03em",
    lineHeight: 1.25,
  },
  center: {
    marginInline: "auto",
    maxWidth: "none",
    textAlign: "center",
  },
  muted: {
    color: colors.mutedForeground,
    display: "block",
  },
});
