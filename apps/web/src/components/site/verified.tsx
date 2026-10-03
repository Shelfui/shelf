"use client";

import * as stylex from "@stylexjs/stylex";
import * as HoverCard from "@/components/ui/hover-card";
import type { CheckKind, Summary } from "@/docs/verify";
import { colors, radius, spacing, typography } from "@/styles/shelf/tokens.stylex";

/** A scalloped seal with a check. The seal takes the text color; the check is cut out of it. */
function Seal({ cut }: { cut: stylex.StaticStyles }) {
  return (
    <svg aria-hidden width={16} height={16} viewBox="0 0 24 24" {...stylex.props(styles.seal)}>
      <path
        d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
        fill="currentColor"
      />
      <path
        d="m9 12 2 2 4-4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        {...stylex.props(cut)}
      />
    </svg>
  );
}

/**
 * The "Verified" pill in a component page's header. Hovering it previews what Shelf measured;
 * the pill itself links to the full list further down the page.
 */
export function VerifiedBadge({
  summary,
  storybookHref,
}: {
  summary: Summary;
  storybookHref?: string;
}) {
  return (
    <HoverCard.Root>
      <HoverCard.Trigger tabIndex={0} delay={100} style={styles.pill}>
        <Seal cut={styles.cutPill} />
        Verified
      </HoverCard.Trigger>
      <HoverCard.Content align="end" side="bottom" sideOffset={8} style={styles.card}>
        <ul {...stylex.props(styles.checks)}>
          <li
            title="This item · with the items and packages it builds on"
            {...stylex.props(styles.check)}
          >
            <span aria-hidden {...stylex.props(styles.mark)}>
              <BoltMark />
            </span>
            Size
            <span {...stylex.props(styles.value)}>
              {summary.own} · {summary.total}
            </span>
          </li>
          {summary.checks.map((check) => (
            <li key={check.label} {...stylex.props(styles.check)}>
              <span aria-hidden {...stylex.props(styles.mark)}>
                <Mark kind={check.kind} />
              </span>
              {check.label}
              <span {...stylex.props(styles.value)}>{check.value}</span>
            </li>
          ))}
        </ul>
        {storybookHref && (
          <a href={storybookHref} target="_blank" rel="noreferrer" {...stylex.props(styles.link)}>
            <span aria-hidden {...stylex.props(styles.mark)}>
              <StorybookMark />
            </span>
            View in Storybook
          </a>
        )}
      </HoverCard.Content>
    </HoverCard.Root>
  );
}

/** Storybook's mark, in its own colors. */
function StorybookMark() {
  return (
    <svg viewBox="0 0 24 24" width={14} height={14}>
      <path
        fill="#ff4785"
        d="M16.71.243l-.12 2.71a.18.18 0 0 0 .29.15l1.06-.8.9.7a.18.18 0 0 0 .28-.14l-.1-2.76 1.33-.1a1.2 1.2 0 0 1 1.279 1.2v21.596a1.2 1.2 0 0 1-1.26 1.2l-16.096-.72a1.2 1.2 0 0 1-1.15-1.16l-.75-19.797a1.2 1.2 0 0 1 1.13-1.27L16.7.222z"
      />
      <path
        fill="#fff"
        d="M13.64 9.3c0 .47 3.16.24 3.59-.08 0-3.2-1.72-4.89-4.859-4.89-3.15 0-4.899 1.72-4.899 4.29 0 4.45 5.999 4.53 5.999 6.959 0 .7-.32 1.1-1.05 1.1-.96 0-1.35-.49-1.3-2.16 0-.36-3.649-.48-3.769 0-.27 4.03 2.23 5.2 5.099 5.2 2.79 0 4.969-1.49 4.969-4.18 0-4.77-6.099-4.64-6.099-6.999 0-.97.72-1.1 1.13-1.1.45 0 1.25.07 1.19 1.87z"
      />
    </svg>
  );
}

/** React's atom: three orbits around a nucleus. */
function ReactMark() {
  return (
    <svg
      viewBox="-12 -12 24 24"
      width={14}
      height={14}
      fill="none"
      stroke="#2fa8c9"
      strokeWidth={1.2}
    >
      <ellipse rx={10} ry={4} />
      <ellipse rx={10} ry={4} transform="rotate(60)" />
      <ellipse rx={10} ry={4} transform="rotate(120)" />
      <circle r={1.8} fill="#2fa8c9" stroke="none" />
    </svg>
  );
}

/** A lightning bolt for size: how little the item adds to a bundle. */
function BoltMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={14}
      height={14}
      fill="#f5a524"
      stroke="#f5a524"
      strokeLinejoin="round"
      strokeWidth={1.5}
    >
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
    </svg>
  );
}

/** The universal access symbol: a figure with open arms in a circle. */
function AccessibilityMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={14}
      height={14}
      fill="none"
      stroke="#3b82f6"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
    >
      <circle cx={12} cy={12} r={10} />
      <circle cx={12} cy={7.4} r={1.1} fill="#3b82f6" />
      <path d="M7 10.4c3.3 1 6.7 1 10 0M12 11.2v3.4m0 0-2 4.2m2-4.2 2 4.2" />
    </svg>
  );
}

/** The React Doctor mark, from the project's own logo (millionco/react-doctor, MIT). */
function DoctorMark() {
  return (
    <svg viewBox="0 0 14 15" width={14} height={14}>
      <path
        fill="#00C2ED"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.34975 9.1499C5.47554 9.27567 5.60246 9.39776 5.73017 9.51594C5.96658 9.73481 5.98087 10.1039 5.762 10.3403C5.54315 10.5767 5.17408 10.591 4.93765 10.3722C4.79891 10.2437 4.66118 10.1112 4.52479 9.97485C4.06765 9.51769 3.65283 9.04379 3.28611 8.56528C3.12189 8.87171 2.98566 9.16985 2.8788 9.45481C2.44604 10.6088 2.56619 11.3165 2.87449 11.6247C3.18279 11.933 3.89043 12.0532 5.04445 11.6204C6.14432 11.208 7.4413 10.3578 8.64921 9.1499C9.18996 8.60909 9.65902 8.05049 10.0492 7.49971C9.65913 6.9491 9.19019 6.39067 8.64956 5.85006C7.44165 4.64215 6.14473 3.79195 5.04484 3.3795C3.89083 2.94674 3.18318 3.06689 2.87487 3.37519C2.56657 3.68349 2.44643 4.39114 2.87919 5.54516C2.98597 5.82991 3.1221 6.12788 3.28618 6.43407C3.65278 5.95579 4.06745 5.48205 4.5244 5.02509C4.67156 4.87793 4.82029 4.73533 4.97016 4.59746C5.20725 4.37933 5.57627 4.39471 5.79439 4.6318C6.01254 4.8689 5.99714 5.23792 5.76005 5.45605C5.62212 5.58294 5.48509 5.71432 5.34936 5.85005C4.80876 6.39067 4.33982 6.9491 3.9497 7.49971C4.33989 8.05049 4.80897 8.60909 5.34975 9.1499ZM1.78681 5.9548C1.97382 6.4535 2.23174 6.97389 2.55289 7.49965C2.23156 8.02564 1.97351 8.54627 1.78642 9.04513C1.32345 10.2798 1.2188 11.619 2.04953 12.4497C2.88026 13.2804 4.21951 13.1758 5.4541 12.7128C6.74288 12.2295 8.17618 11.2728 9.47416 9.97485C9.93132 9.51769 10.3461 9.04373 10.7128 8.56528C10.8771 8.87171 11.0133 9.16985 11.1202 9.45481C11.5529 10.6088 11.4328 11.3165 11.1245 11.6247C10.8368 11.9124 10.2016 12.0406 9.15467 11.6914C8.84906 11.5895 8.51866 11.7546 8.41675 12.0602C8.31484 12.3659 8.47993 12.6962 8.78553 12.7981C9.93704 13.1822 11.1688 13.2303 11.9494 12.4497C12.7801 11.619 12.6755 10.2798 12.2125 9.04513C12.0254 8.54627 11.7674 8.02564 11.4461 7.49965C11.7672 6.97389 12.0251 6.4535 12.2122 5.95479C12.6751 4.7202 12.7797 3.38095 11.949 2.55022C11.1741 1.77528 9.95424 1.81741 8.81202 2.1929C8.506 2.29351 8.33946 2.62318 8.44003 2.92923C8.54065 3.23528 8.87035 3.40183 9.17637 3.30121C10.2114 2.96097 10.8386 3.08976 11.1241 3.37518C11.4324 3.68348 11.5525 4.39112 11.1197 5.54514C11.013 5.8299 10.8768 6.12788 10.7128 6.43407C10.3461 5.95579 9.93149 5.48206 9.47451 5.0251C8.17659 3.72715 6.74323 2.7704 5.45449 2.28712C4.2199 1.82415 2.88064 1.7195 2.04992 2.55023C1.21919 3.38096 1.32383 4.72021 1.78681 5.9548ZM6.99995 8.375C7.48318 8.375 7.87495 7.98323 7.87495 7.5C7.87495 7.01677 7.48318 6.625 6.99995 6.625C6.51666 6.625 6.12495 7.01677 6.12495 7.5C6.12495 7.98323 6.51666 8.375 6.99995 8.375Z"
      />
    </svg>
  );
}

function Mark({ kind }: { kind: CheckKind }) {
  if (kind === "storybook") return <StorybookMark />;
  if (kind === "react") return <ReactMark />;
  if (kind === "axe") return <AccessibilityMark />;
  return <DoctorMark />;
}

const styles = stylex.create({
  pill: {
    borderColor: colors.border,
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 1,
    gap: spacing["1.5"],
    paddingBlock: spacing["1"],
    paddingInline: spacing["3"],
    paddingInlineStart: spacing["2"],
    alignItems: "center",
    backgroundColor: { default: colors.card, ":hover": colors.muted },
    display: "inline-flex",
    flexShrink: 0,
    fontSize: typography.fontSizeSm,
    textDecorationLine: "none",
  },
  seal: {
    flexShrink: 0,
  },
  cutPill: {
    stroke: colors.card,
  },
  card: {
    gap: spacing["3"],
    padding: spacing["3"],
    display: "grid",
    width: "16rem",
  },
  checks: {
    gap: spacing["1.5"],
    listStyleType: "none",
    margin: 0,
    padding: 0,
    display: "grid",
  },
  value: {
    color: colors.mutedForeground,
    fontVariantNumeric: "tabular-nums",
    marginInlineStart: "auto",
    whiteSpace: "nowrap",
  },
  check: {
    gap: spacing["2"],
    alignItems: "center",
    display: "flex",
  },
  mark: {
    alignItems: "center",
    color: colors.mutedForeground,
    display: "inline-flex",
    flexShrink: 0,
  },
  link: {
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: 1,
    gap: spacing["2"],
    paddingTop: spacing["3"],
    alignItems: "center",
    color: colors.foreground,
    display: "flex",
    textDecorationLine: "none",
  },
});
