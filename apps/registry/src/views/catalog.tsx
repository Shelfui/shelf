import * as stylex from "@stylexjs/stylex";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Command } from "@/components/site/command";
import { FigmaLogo } from "@/components/site/brand-logos";
import { PageHeader } from "@/components/site/page-header";
import { layout } from "@/components/site/styles";
import { Badge } from "@/components/ui/badge";
import * as Empty from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup } from "@/components/ui/toggle-group";
import { projectsUsing, useRegistry } from "@/data";
import { media } from "@/styles/shelf/conditions.stylex";
import { colors, motion, radius, spacing, typography } from "@/styles/shelf/tokens.stylex";
import { site } from "@/styles/site.stylex";

export function Catalog() {
  const registry = useRegistry();
  const { q = "", type } = useSearch({ from: "/" });
  const navigate = useNavigate({ from: "/" });
  const types = [...new Set(registry.items.map((item) => item.type))].toSorted();
  const query = q.trim().toLowerCase();
  const items = registry.items.filter(
    (item) =>
      (!type || item.type === type) &&
      (!query ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)),
  );

  return (
    <div {...stylex.props(layout.stack)}>
      <PageHeader
        title={
          <>
            One source
            <br />
            <span {...stylex.props(styles.titleMuted)}>for every interface</span>
          </>
        }
        lead={
          <>
            {registry.items.length} components, blocks, and foundations. Adding one copies its
            source into your project.
            <br />
            Every install is recorded, so you can see where each item is used and which copies are
            behind.
          </>
        }
      >
        <Command args={`init --registry ${registry.url}`} label="init command" switcher />
      </PageHeader>

      <div {...stylex.props(layout.row)}>
        <Input
          type="search"
          aria-label="Search items"
          placeholder="Search items"
          value={q}
          onChange={(event) =>
            void navigate({
              search: (prev) => ({ ...prev, q: event.target.value || undefined }),
              replace: true,
            })
          }
          style={styles.search}
        />
        <ToggleGroup
          aria-label="Item type"
          value={type ? [type] : []}
          onValueChange={(value: string[]) =>
            void navigate({ search: (prev) => ({ ...prev, type: value[0] }) })
          }
        >
          {types.map((name) => (
            <Toggle key={name} value={name} size="sm" variant="outline">
              {name}
            </Toggle>
          ))}
        </ToggleGroup>
      </div>

      {items.length === 0 ? (
        <Empty.Root>
          <Empty.Header>
            <Empty.Title>No items match</Empty.Title>
            <Empty.Description>Try a different search or type.</Empty.Description>
          </Empty.Header>
        </Empty.Root>
      ) : (
        <ul {...stylex.props(styles.grid)}>
          {items.map((item) => {
            const usage = registry.usage && projectsUsing(registry.usage, item.name);
            const count = usage ? usage.installed.length + usage.consuming.length : 0;
            return (
              <li key={item.name} {...stylex.props(styles.cell)}>
                <Link to="/items/$name" params={{ name: item.name }} {...stylex.props(styles.tile)}>
                  <span {...stylex.props(styles.tileHead)}>
                    <span {...stylex.props(styles.tileName)}>{item.name}</span>
                    <span {...stylex.props(styles.tileTags)}>
                      {item.figma && (
                        <span title="In Figma" {...stylex.props(styles.figma)}>
                          <FigmaLogo size="0.875rem" />
                          <span {...stylex.props(styles.hidden)}>In Figma</span>
                        </span>
                      )}
                      <Badge variant="outline">{item.type}</Badge>
                    </span>
                  </span>
                  <span {...stylex.props(styles.tileDescription)}>{item.description}</span>
                  {registry.usage && (
                    <span {...stylex.props(styles.tileMeta)}>
                      {count === 0
                        ? "Not used yet"
                        : `Used in ${count} project${count === 1 ? "" : "s"}`}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

const styles = stylex.create({
  titleMuted: {
    color: colors.mutedForeground,
  },
  search: {
    maxWidth: "20rem",
  },
  grid: {
    display: "grid",
    gap: spacing["3"],
    gridTemplateColumns: "repeat(auto-fill, minmax(18rem, 1fr))",
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  cell: {
    display: "flex",
  },
  tile: {
    backgroundColor: {
      default: colors.card,
      [media.hover]: { default: null, ":hover": colors.muted },
    },
    borderRadius: radius.lg,
    color: "inherit",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    gap: spacing["2"],
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    paddingBlock: spacing["6"],
    paddingInline: spacing["6"],
    textDecoration: "none",
    transitionDuration: motion.durationFast,
    transitionProperty: "background-color",
  },
  tileHead: {
    alignItems: "center",
    display: "flex",
    gap: spacing["2"],
    justifyContent: "space-between",
  },
  tileTags: {
    alignItems: "center",
    display: "flex",
    gap: spacing["2"],
  },
  figma: {
    display: "flex",
  },
  hidden: {
    clip: "rect(0 0 0 0)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    whiteSpace: "nowrap",
    width: 1,
  },
  tileName: {
    fontSize: site.fontSizeXl,
    letterSpacing: "-0.02em",
  },
  tileDescription: {
    color: colors.mutedForeground,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
  },
  tileMeta: {
    color: colors.mutedForeground,
    fontSize: typography.fontSizeXs,
    marginTop: "auto",
    paddingTop: spacing["2"],
  },
});
