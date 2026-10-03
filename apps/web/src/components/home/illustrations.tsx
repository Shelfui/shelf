import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { media } from "@/styles/shelf/conditions.stylex";
import { colors } from "@/styles/shelf/tokens.stylex";

function Art({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 200"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...stylex.props(styles.svg)}
    >
      {children}
    </svg>
  );
}

/** A component leaves the registry and settles into your app's source. */
export function SourceArt() {
  return (
    <Art>
      <rect x="30" y="30" width="50" height="50" strokeDasharray="4 6" />
      <rect x="70" y="70" width="100" height="100" />
      <rect x="30" y="30" width="50" height="50" {...stylex.props(styles.moving, styles.copy)} />
    </Art>
  );
}

/** Focus steps from control to control, the way Tab moves it. */
export function AccessibleArt() {
  return (
    <Art>
      {[34, 82, 130].map((x) => (
        <rect key={x} x={x} y="82" width="36" height="36" />
      ))}
      <rect x="26" y="74" width="52" height="52" {...stylex.props(styles.moving, styles.focus)} />
    </Art>
  );
}

/** Styles become atomic classes, generated once at build time. */
export function CompiledArt() {
  const cells = [0, 1, 2].flatMap((row) => [0, 1, 2].map((column) => ({ row, column })));
  return (
    <Art>
      {cells.map(({ row, column }) => (
        <rect
          key={`${row}-${column}`}
          x={38 + column * 44}
          y={38 + row * 44}
          width="36"
          height="36"
          fill="currentColor"
          {...stylex.props(styles.cell, delays[row + column])}
        />
      ))}
    </Art>
  );
}

/** The installed base, and the local change that branches from it. */
export function TrackedArt() {
  return (
    <Art>
      <path d="M70 154 L70 46" pathLength={1} {...stylex.props(styles.draw, styles.trunk)} />
      <path
        d="M70 128 C70 92 130 100 130 62"
        pathLength={1}
        {...stylex.props(styles.draw, styles.branch)}
      />
      <circle cx="70" cy="164" r="10" />
      <circle cx="70" cy="36" r="10" />
      <circle cx="130" cy="52" r="10" {...stylex.props(styles.moving, styles.pop)} />
    </Art>
  );
}

/** A person browsing: the selection moves from item to item in the catalog. */
export function BrowseArt() {
  const cells = [0, 1].flatMap((row) => [0, 1].map((column) => ({ row, column })));
  return (
    <Art>
      {cells.map(({ row, column }) => (
        <rect
          key={`${row}-${column}`}
          x={44 + column * 64}
          y={44 + row * 64}
          width="48"
          height="48"
        />
      ))}
      <rect x="36" y="36" width="64" height="64" {...stylex.props(styles.moving, styles.browse)} />
    </Art>
  );
}

/** An agent reading a file, line by line. */
export function ReadArt() {
  const lines = [
    [72, 128],
    [72, 112],
    [84, 136],
    [84, 120],
    [72, 104],
  ] as const;
  return (
    <Art>
      <rect x="50" y="30" width="100" height="140" />
      {lines.map(([start, end], index) => (
        <path
          key={index}
          d={`M${start} ${62 + index * 20} L${end} ${62 + index * 20}`}
          pathLength={1}
          {...stylex.props(styles.draw, styles.read, delays[index])}
        />
      ))}
    </Art>
  );
}

/** One registry item, and the projects that installed it. */
export function GraphArt() {
  const projects = [
    [44, 44],
    [156, 44],
    [156, 156],
    [44, 156],
  ] as const;
  return (
    <Art>
      {projects.map(([x, y], index) => (
        <g key={index}>
          <path
            d={`M100 100 L${x} ${y}`}
            pathLength={1}
            {...stylex.props(styles.draw, styles.edge, delays[index])}
          />
          <circle cx={x} cy={y} r="10" {...stylex.props(styles.opaque)} />
        </g>
      ))}
      <rect x="84" y="84" width="32" height="32" fill="currentColor" />
    </Art>
  );
}

/** Copies at different revisions; the one behind catches up. */
export function DriftArt() {
  return (
    <Art>
      {[60, 100, 140].map((y) => (
        <path key={y} d={`M40 ${y} L160 ${y}`} strokeDasharray="4 6" />
      ))}
      <rect x="140" y="50" width="20" height="20" fill="currentColor" />
      <rect x="80" y="90" width="20" height="20" {...stylex.props(styles.moving, styles.catchUp)} />
      <rect x="140" y="130" width="20" height="20" {...stylex.props(styles.opaque)} />
    </Art>
  );
}

const browse = stylex.keyframes({
  "0%, 20%": { transform: "translate(0, 0)" },
  "25%, 45%": { transform: "translate(64px, 0)" },
  "50%, 70%": { transform: "translate(64px, 64px)" },
  "75%, 95%": { transform: "translate(0, 64px)" },
  "100%": { transform: "translate(0, 0)" },
});

const write = stylex.keyframes({
  "0%": { opacity: 1, strokeDashoffset: 1 },
  "20%, 80%": { opacity: 1, strokeDashoffset: 0 },
  "100%": { opacity: 0, strokeDashoffset: 0 },
});

const catchUp = stylex.keyframes({
  "0%, 25%": { transform: "translateX(0)" },
  "55%, 85%": { transform: "translateX(60px)" },
  "100%": { transform: "translateX(0)" },
});

const copy = stylex.keyframes({
  "0%": { opacity: 0, transform: "translate(0, 0)" },
  "12%": { opacity: 1, transform: "translate(0, 0)" },
  "45%": { opacity: 1, transform: "translate(65px, 65px)" },
  "85%": { opacity: 1, transform: "translate(65px, 65px)" },
  "100%": { opacity: 0, transform: "translate(65px, 65px)" },
});

const focus = stylex.keyframes({
  "0%, 22%": { transform: "translateX(0)" },
  "33%, 55%": { transform: "translateX(48px)" },
  "66%, 88%": { transform: "translateX(96px)" },
  "100%": { transform: "translateX(0)" },
});

const light = stylex.keyframes({
  "0%": { fillOpacity: 0 },
  "15%": { fillOpacity: 1 },
  "40%, 100%": { fillOpacity: 0 },
});

const trunk = stylex.keyframes({
  "0%": { strokeDashoffset: 1 },
  "30%, 100%": { strokeDashoffset: 0 },
});

const branch = stylex.keyframes({
  "0%, 35%": { strokeDashoffset: 1 },
  "65%, 100%": { strokeDashoffset: 0 },
});

const pop = stylex.keyframes({
  "0%, 60%": { opacity: 0, transform: "scale(0.4)" },
  "72%, 92%": { opacity: 1, transform: "scale(1)" },
  "100%": { opacity: 0, transform: "scale(1)" },
});

const styles = stylex.create({
  svg: {
    display: "block",
    height: "auto",
    maxWidth: "18rem",
    overflow: "visible",
    width: "70%",
  },
  moving: {
    animationDuration: "5s",
    animationIterationCount: "infinite",
    animationTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)",
    transformBox: "fill-box",
    transformOrigin: "center",
  },
  copy: {
    animationName: { default: copy, [media.reducedMotion]: "none" },
    transform: { default: null, [media.reducedMotion]: "translate(65px, 65px)" },
  },
  focus: {
    animationDuration: "4s",
    animationName: { default: focus, [media.reducedMotion]: "none" },
  },
  cell: {
    animationDuration: "3s",
    animationIterationCount: "infinite",
    animationName: { default: light, [media.reducedMotion]: "none" },
    animationTimingFunction: "ease-out",
    fillOpacity: 0,
  },
  draw: {
    animationDuration: "5s",
    animationIterationCount: "infinite",
    animationTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)",
    strokeDasharray: 1,
    strokeDashoffset: { default: 1, [media.reducedMotion]: 0 },
  },
  trunk: {
    animationName: { default: trunk, [media.reducedMotion]: "none" },
  },
  branch: {
    animationName: { default: branch, [media.reducedMotion]: "none" },
  },
  pop: {
    animationName: { default: pop, [media.reducedMotion]: "none" },
  },
  browse: {
    animationDuration: "6s",
    animationName: { default: browse, [media.reducedMotion]: "none" },
  },
  read: {
    animationDuration: "4s",
    animationName: { default: write, [media.reducedMotion]: "none" },
    animationTimingFunction: "ease-out",
  },
  edge: {
    animationDuration: "4s",
    animationName: { default: write, [media.reducedMotion]: "none" },
  },
  catchUp: {
    animationName: { default: catchUp, [media.reducedMotion]: "none" },
    fill: colors.card,
    transform: { default: null, [media.reducedMotion]: "translateX(60px)" },
  },
  opaque: {
    fill: colors.card,
  },
});

const wave = stylex.create({
  d0: { animationDelay: "0s" },
  d1: { animationDelay: "0.15s" },
  d2: { animationDelay: "0.3s" },
  d3: { animationDelay: "0.45s" },
  d4: { animationDelay: "0.6s" },
});

/** Delays by diagonal, so the grid lights up corner to corner. */
const delays = [wave.d0, wave.d1, wave.d2, wave.d3, wave.d4];
