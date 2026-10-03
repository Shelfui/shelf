import * as stylex from "@stylexjs/stylex";
import { expect } from "storybook/test";
import preview from "@/.storybook/preview";
import { colors, spacing, typography } from "../../foundations/tokens.stylex";
import * as Icons from "./icons";

const meta = preview.meta({
  title: "Components/Icons",
});

const icons = Object.entries(Icons).filter(([name]) => name.endsWith("Icon"));

/** Every icon Shelf components use. Icons follow the font size and color around them. */
export const Gallery = meta.story({
  render: () => (
    <ul {...stylex.props(styles.grid)}>
      {icons.map(([name, Icon]) => (
        <li key={name} {...stylex.props(styles.cell)}>
          <Icon {...stylex.props(styles.icon)} />
          <span>{name}</span>
        </li>
      ))}
    </ul>
  ),
  play: async ({ canvasElement }) => {
    const svgs = canvasElement.querySelectorAll("svg");

    await expect(svgs).toHaveLength(icons.length);
    for (const svg of svgs) await expect(svg).toHaveAttribute("aria-hidden", "true");
  },
});

const styles = stylex.create({
  grid: {
    margin: 0,
    padding: 0,
    gap: spacing["4"],
    listStyle: "none",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(10rem, 1fr))",
  },
  cell: {
    gap: spacing["2"],
    alignItems: "center",
    color: colors.foreground,
    display: "flex",
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeXs,
  },
  icon: {
    fontSize: typography.fontSizeLg,
  },
});
