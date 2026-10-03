import * as stylex from "@stylexjs/stylex";
import { colors, radius, spacing, typography } from "@/styles/shelf/tokens.stylex";
import { LoginForm, type LoginFormProps } from "./login-form";

/**
 * A full-page sign-in: a brand panel with a quote beside the login form. Below 48rem
 * the panel hides and the form fills the page. Pass `image` to fill the panel with a photo.
 */
export function LoginSplit({ onSubmit, image }: LoginSplitProps) {
  return (
    <div {...stylex.props(styles.page)}>
      <aside {...stylex.props(styles.panel, image ? styles.panelImage : null)}>
        {image && <img src={image} alt="" {...stylex.props(styles.image)} />}
        <div {...stylex.props(styles.brand)}>
          <span aria-hidden {...stylex.props(styles.logo)}>
            A
          </span>
          Acme Inc.
        </div>
        <figure {...stylex.props(styles.quote)}>
          <blockquote {...stylex.props(styles.blockquote)}>
            “We replaced three internal tools in a quarter, and every team still owns its own
            screens.”
          </blockquote>
          <figcaption {...stylex.props(styles.caption, image ? styles.captionImage : null)}>
            Grace Hopper, Head of Platform
          </figcaption>
        </figure>
      </aside>
      <main {...stylex.props(styles.main)}>
        <LoginForm onSubmit={onSubmit} />
      </main>
    </div>
  );
}

export type LoginSplitProps = LoginFormProps & {
  /** A decorative photo behind the brand panel. The quote turns light to stay readable. */
  image?: string;
};

const WIDE = "@media (min-width: 48rem)";

const styles = stylex.create({
  page: {
    backgroundColor: colors.background,
    color: colors.foreground,
    display: "grid",
    fontFamily: typography.fontFamily,
    gridTemplateColumns: { [WIDE]: "1fr 1fr", default: "1fr" },
    minHeight: "100svh",
  },
  panel: {
    padding: spacing["6"],
    backgroundColor: colors.muted,
    display: { [WIDE]: "flex", default: "none" },
    flexDirection: "column",
    isolation: "isolate",
    justifyContent: "space-between",
    position: "relative",
  },
  panelImage: {
    // Photos stay the same in light and dark themes, so the text over them does too.
    backgroundColor: "#0a0a0a",
    color: "#fff",
    "::after": {
      inset: 0,
      backgroundImage: "linear-gradient(to top, rgb(0 0 0 / 0.6), transparent 60%)",
      content: "''",
      position: "absolute",
      zIndex: -1,
    },
  },
  image: {
    inset: 0,
    objectFit: "cover",
    position: "absolute",
    zIndex: -2,
    height: "100%",
    width: "100%",
  },
  brand: {
    gap: spacing["2"],
    alignItems: "center",
    display: "flex",
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightSemibold,
    lineHeight: typography.lineHeightSm,
  },
  logo: {
    borderRadius: radius.sm,
    alignItems: "center",
    backgroundColor: colors.primary,
    color: colors.primaryForeground,
    display: "inline-flex",
    fontSize: typography.fontSizeXs,
    justifyContent: "center",
    height: "1.5rem",
    width: "1.5rem",
  },
  quote: {
    margin: 0,
    gap: spacing["2"],
    display: "grid",
    maxWidth: "28rem",
  },
  blockquote: {
    margin: 0,
    fontSize: typography.fontSizeLg,
    lineHeight: typography.lineHeightLg,
  },
  caption: {
    color: colors.mutedForeground,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
  },
  captionImage: {
    color: "rgb(255 255 255 / 0.75)",
  },
  main: {
    padding: spacing["6"],
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
  },
});
