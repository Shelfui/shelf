import * as stylex from "@stylexjs/stylex";
import { Link, useParams } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import { Command } from "@/components/site/command";
import { StateBadge } from "@/components/site/item-state";
import { useTheme } from "@/components/site/layout";
import { PageHeader } from "@/components/site/page-header";
import { FigmaLogo, StorybookLogo } from "@/components/site/brand-logos";
import { ProjectLink } from "@/components/site/links";
import { SourceFile } from "@/components/site/source-file";
import { layout, text } from "@/components/site/styles";
import { Badge } from "@/components/ui/badge";
import { ExternalLinkIcon } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import * as Select from "@/components/ui/select";
import * as Table from "@/components/ui/table";
import * as Tabs from "@/components/ui/tabs";
import * as T from "@/components/ui/typography";
import {
  type IndexItem,
  type Registry,
  type Story,
  fetchJson,
  itemState,
  projectsUsing,
  storiesFor,
  useAsync,
  useRegistry,
} from "@/data";
import { NotFound } from "@/views/not-found";
import { media } from "@/styles/shelf/conditions.stylex";
import { colors, motion, radius, spacing, typography } from "@/styles/shelf/tokens.stylex";
import { screens, site } from "@/styles/site.stylex";

interface Manifest {
  files: Array<{ path: string }>;
  dependencies?: Record<string, string>;
  shelfDependencies?: string[];
}

export function Item() {
  const { name } = useParams({ from: "/items/$name" });
  const registry = useRegistry();
  const item = registry.items.find((entry) => entry.name === name);
  if (!item) return <NotFound title={`No item "${name}"`}>It isn't in this registry.</NotFound>;
  return <ItemPage key={item.name} registry={registry} item={item} />;
}

function ItemPage({ registry, item }: { registry: Registry; item: IndexItem }) {
  const manifest = useAsync(async () => {
    const found = await fetchJson<Manifest>(`${item.path}/registry.json`);
    if (!found) throw new Error(`${item.path}/registry.json is missing.`);
    return found;
  }, item.path);
  const stories = storiesFor(registry, item);
  const history = registry.history[item.name] ?? [];
  const dependents = registry.items.filter((entry) => entry.shelfDependencies?.includes(item.name));
  const [story, setStory] = useState(stories[0]);
  const tabs = [
    story && "storybook",
    "code",
    registry.usage && "usage",
    history.length > 0 && "history",
  ].filter((tab): tab is string => Boolean(tab));
  const packages = Object.entries(manifest.value?.dependencies ?? item.dependencies ?? {});

  return (
    <div {...stylex.props(styles.page)}>
      <Sidebar items={registry.items} />
      <div {...stylex.props(layout.stack, styles.main)}>
        <PageHeader
          eyebrow={
            <>
              <Link to="/" {...stylex.props(text.link)}>
                Catalog
              </Link>
              <span aria-hidden>/</span>
              <Badge variant="outline">{item.type}</Badge>
            </>
          }
          title={item.name}
          lead={item.description}
        >
          <Command args={`add ${item.name}`} label="add command" switcher />
        </PageHeader>

        <Tabs.Root defaultValue={tabs[0]} style={styles.tabs}>
          <Tabs.List>
            {story && <Tabs.Tab value="storybook">Storybook</Tabs.Tab>}
            <Tabs.Tab value="code">Code</Tabs.Tab>
            {tabs.includes("usage") && <Tabs.Tab value="usage">Usage</Tabs.Tab>}
            {tabs.includes("history") && <Tabs.Tab value="history">History</Tabs.Tab>}
          </Tabs.List>
          {story && (
            <Tabs.Panel value="storybook">
              <Preview stories={stories} story={story} onStoryChange={setStory} />
            </Tabs.Panel>
          )}
          <Tabs.Panel value="code" style={styles.files}>
            {manifest.error && <T.Muted>{manifest.error.message}</T.Muted>}
            {!manifest.value && !manifest.error && <Skeleton style={styles.skeleton} />}
            {manifest.value?.files.map((file) => (
              <SourceFile key={file.path} path={`${item.path}/${file.path}`} name={file.path} />
            ))}
          </Tabs.Panel>
          {tabs.includes("usage") && (
            <Tabs.Panel value="usage">
              <ItemUsage registry={registry} name={item.name} />
            </Tabs.Panel>
          )}
          {tabs.includes("history") && (
            <Tabs.Panel value="history">
              <History item={item} history={history} />
            </Tabs.Panel>
          )}
        </Tabs.Root>
      </div>

      <aside aria-label={`About ${item.name}`} {...stylex.props(styles.aside)}>
        {(item.figma || story) && (
          <AsideSection title="Open in">
            <ul {...stylex.props(styles.list)}>
              {item.figma && (
                <li>
                  <OutLink href={item.figma} icon={<FigmaLogo />}>
                    Figma
                  </OutLink>
                </li>
              )}
              {story && (
                <li>
                  <OutLink
                    href={`storybook/?path=/story/${encodeURIComponent(story.id)}`}
                    icon={<StorybookLogo />}
                  >
                    Storybook
                  </OutLink>
                </li>
              )}
            </ul>
          </AsideSection>
        )}
        <AsideSection title="Needs">
          <Links names={manifest.value?.shelfDependencies ?? item.shelfDependencies ?? []} />
        </AsideSection>
        <AsideSection title="Needed by">
          <Links names={dependents.map((entry) => entry.name)} />
        </AsideSection>
        <AsideSection title="Packages">
          {packages.length === 0 ? (
            <T.Muted>None</T.Muted>
          ) : (
            <ul {...stylex.props(styles.list)}>
              {packages.map(([pkg, range]) => (
                <li key={pkg} {...stylex.props(text.mono)}>
                  {pkg} <span {...stylex.props(styles.range)}>{range}</span>
                </li>
              ))}
            </ul>
          )}
        </AsideSection>
      </aside>
    </div>
  );
}

function AsideSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div {...stylex.props(styles.navGroup)}>
      <h2 {...stylex.props(styles.navTitle)}>{title}</h2>
      {children}
    </div>
  );
}

function OutLink({ href, icon, children }: { href: string; icon: ReactNode; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      {...stylex.props(styles.navLink, styles.outLink)}
    >
      {icon}
      {children}
      <span {...stylex.props(styles.outIcon)}>
        <ExternalLinkIcon />
      </span>
    </a>
  );
}

const TYPE_LABELS: Record<string, string> = {
  component: "Components",
  block: "Blocks",
  foundation: "Foundations",
  lib: "Libraries",
};

function Sidebar({ items }: { items: IndexItem[] }) {
  const types = [...new Set(items.map((item) => item.type))].toSorted(
    (a, b) => rank(a) - rank(b) || a.localeCompare(b),
  );
  const link = stylex.props(styles.navLink);
  const active = stylex.props(styles.navLink, styles.navActive);
  return (
    <nav aria-label="Items" {...stylex.props(styles.sidebar)}>
      {types.map((type) => (
        <div key={type} {...stylex.props(styles.navGroup)}>
          <h2 {...stylex.props(styles.navTitle)}>{TYPE_LABELS[type] ?? type}</h2>
          <ul {...stylex.props(styles.list)}>
            {items
              .filter((item) => item.type === type)
              .map((item) => (
                <li key={item.name}>
                  <Link
                    to="/items/$name"
                    params={{ name: item.name }}
                    inactiveProps={link}
                    activeProps={active}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function rank(type: string): number {
  const index = Object.keys(TYPE_LABELS).indexOf(type);
  return index === -1 ? Infinity : index;
}

function Links({ names }: { names: string[] }) {
  if (names.length === 0) return <T.Muted>None</T.Muted>;
  return (
    <ul {...stylex.props(styles.list)}>
      {names.map((name) => (
        <li key={name}>
          <Link to="/items/$name" params={{ name }} {...stylex.props(styles.navLink)}>
            {name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Preview({
  stories,
  story,
  onStoryChange,
}: {
  stories: Story[];
  story: Story;
  onStoryChange: (story: Story) => void;
}) {
  const theme = useTheme();
  const variants = stories.map((entry) => ({ value: entry.id, label: entry.name }));
  return (
    <div {...stylex.props(layout.section)}>
      <div {...stylex.props(layout.row)}>
        {stories.length > 1 ? (
          <Select.Root
            items={variants}
            value={story.id}
            onValueChange={(value: string | null) => {
              const next = stories.find((entry) => entry.id === value);
              if (next) onStoryChange(next);
            }}
          >
            <Select.Trigger aria-label="Variant" style={styles.variant}>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {variants.map((variant) => (
                <Select.Item key={variant.value} value={variant.value}>
                  {variant.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        ) : (
          <span {...stylex.props(text.muted)}>{story.name}</span>
        )}
      </div>
      {/* The registry's own Storybook build, served from the same host. */}
      {/* oxlint-disable-next-line react/iframe-missing-sandbox */}
      <iframe
        key={`${story.id}:${theme}`}
        title={`${story.title}: ${story.name}`}
        src={`storybook/iframe.html?id=${encodeURIComponent(story.id)}&viewMode=story&globals=theme:${theme}`}
        {...stylex.props(styles.frame)}
      />
    </div>
  );
}

function ItemUsage({ registry, name }: { registry: Registry; name: string }) {
  const usage = registry.usage;
  if (!usage) return null;
  const { installed, consuming } = projectsUsing(usage, name);
  if (installed.length + consuming.length === 0) {
    return <T.Muted>No project uses {name} yet.</T.Muted>;
  }
  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head>Project</Table.Head>
          <Table.Head>State</Table.Head>
          <Table.Head>Imported by</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {installed.map((project) => {
          const entry = project.items[name];
          if (!entry) return null;
          const files = entry.usedBy.map((ref) => ref.project ?? ref.file);
          return (
            <Table.Row key={project.id}>
              <Table.Cell>
                <ProjectLink id={project.id} />
              </Table.Cell>
              <Table.Cell>
                <StateBadge state={itemState(entry)} />
              </Table.Cell>
              <Table.Cell>
                <span {...stylex.props(text.muted)}>
                  {files.length > 0
                    ? `${new Set(files).size} file${new Set(files).size === 1 ? "" : "s"}`
                    : entry.via.length > 0
                      ? `via ${entry.via.join(", ")}`
                      : "Nothing"}
                </span>
              </Table.Cell>
            </Table.Row>
          );
        })}
        {consuming.map((project) => (
          <Table.Row key={project.id}>
            <Table.Cell>
              <ProjectLink id={project.id} />
            </Table.Cell>
            <Table.Cell>
              <StateBadge state="consumed" />
            </Table.Cell>
            <Table.Cell>
              <span {...stylex.props(text.muted)}>
                from{" "}
                {project.consumes
                  .filter((consumed) => consumed.item === name)
                  .map((consumed) => consumed.package ?? consumed.provider)
                  .join(", ")}
              </span>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

function History({ item, history }: { item: IndexItem; history: Registry["history"][string] }) {
  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head>Revision</Table.Head>
          <Table.Head>Commit</Table.Head>
          <Table.Head>Date</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {history.map((entry) => (
          <Table.Row key={entry.revision}>
            <Table.Cell>
              <span {...stylex.props(layout.row)}>
                <code {...stylex.props(text.mono)}>{entry.revision.slice(0, 12)}</code>
                {entry.revision === item.revision && <Badge variant="secondary">Current</Badge>}
              </span>
            </Table.Cell>
            <Table.Cell>
              <code {...stylex.props(text.mono)}>{entry.commit.slice(0, 7)}</code>
            </Table.Cell>
            <Table.Cell>{entry.date.slice(0, 10)}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

const styles = stylex.create({
  page: {
    alignItems: "start",
    display: "grid",
    gap: site.space12,
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [screens.lg]: "12rem minmax(0, 1fr)",
      [screens.xl]: "12rem minmax(0, 1fr) 14rem",
    },
  },
  sidebar: {
    boxSizing: "border-box",
    gridRow: { default: null, [screens.lg]: "1 / span 2" },
    display: { default: "none", [screens.lg]: "flex" },
    flexDirection: "column",
    gap: spacing["6"],
    maxHeight: "calc(100vh - 5rem)",
    overflowY: "auto",
    paddingBottom: site.space8,
    paddingTop: site.space16,
    position: "sticky",
    top: "5rem",
  },
  navGroup: {
    display: "flex",
    flexDirection: "column",
    gap: spacing["2"],
  },
  navTitle: {
    color: colors.foreground,
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    margin: 0,
  },
  navLink: {
    borderRadius: radius.md,
    color: {
      default: colors.mutedForeground,
      [media.hover]: { default: null, ":hover": colors.foreground },
    },
    display: "block",
    fontSize: typography.fontSizeSm,
    marginInline: `calc(-1 * ${spacing["2"]})`,
    paddingBlock: spacing["1"],
    paddingInline: spacing["2"],
    textDecoration: "none",
    transitionDuration: motion.durationFast,
    transitionProperty: "color",
  },
  outLink: {
    alignItems: "center",
    display: "flex",
    gap: spacing["2"],
  },
  outIcon: {
    color: colors.mutedForeground,
    display: "flex",
    marginInlineStart: "auto",
  },
  range: {
    color: colors.mutedForeground,
  },
  aside: {
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: spacing["6"],
    gridColumn: { default: null, [screens.lg]: "2", [screens.xl]: "3" },
    paddingTop: { default: null, [screens.xl]: site.space16 },
    position: { default: null, [screens.xl]: "sticky" },
    top: "5rem",
  },
  navActive: {
    backgroundColor: colors.card,
    color: colors.foreground,
  },
  variant: {
    width: "16rem",
  },
  main: {
    minWidth: 0,
  },
  tabs: {
    minWidth: 0,
  },
  files: {
    display: "flex",
    flexDirection: "column",
    gap: spacing["4"],
  },
  skeleton: {
    height: "12rem",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: spacing["1"],
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  frame: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    height: "32rem",
    width: "100%",
  },
});
