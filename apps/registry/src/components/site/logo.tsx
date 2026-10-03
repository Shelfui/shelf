import * as stylex from "@stylexjs/stylex";
import { media } from "@/styles/shelf/conditions.stylex";

/** The Shelf mark. Hovering the nearest `stylex.defaultMarker()` ancestor straightens the book. */
export function Logo() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      {...stylex.props(styles.mark)}
    >
      <rect x="4" y="4" width="24" height="24" />
      <path d="M4 16H28" />
      <path d="M9 16V9" />
      <path d="M12.5 16V9" />
      {/* A butt cap keeps the foot inside the shelf line; the top end is extended to match. */}
      <path d="M16 16L19.88 9.35" strokeLinecap="butt" {...stylex.props(styles.book)} />
      <path d="M19.5 28V21" />
      <path d="M23 28V21" />
    </svg>
  );
}

const styles = stylex.create({
  mark: {
    display: "block",
    flexShrink: 0,
    height: "1.75rem",
    width: "1.75rem",
  },
  book: {
    transformBox: "view-box",
    transformOrigin: "16px 16px",
    transform: {
      default: null,
      [stylex.when.ancestor(":hover")]: "rotate(-30deg)",
      [stylex.when.ancestor(":focus-visible")]: "rotate(-30deg)",
    },
    transitionDuration: { default: "450ms", [media.reducedMotion]: "0s" },
    transitionProperty: "transform",
    transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
});
