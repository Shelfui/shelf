"use client";

import * as stylex from "@stylexjs/stylex";
import { useId, useState } from "react";
import { Badge, type BadgeVariant } from "../../components/badge/badge";
import { Button } from "../../components/button/button";
import * as Card from "../../components/card/card";
import * as Empty from "../../components/empty/empty";
import * as Item from "../../components/item/item";
import { colors, spacing, typography } from "../../foundations/tokens.stylex";
import { ConfirmDialog } from "../../patterns/confirm-dialog/confirm-dialog";

export type ProjectStatus = "active" | "paused" | "archived";

export interface Project {
  id: string;
  name: string;
  owner: string;
  status: ProjectStatus;
  /** Already formatted for display, such as "3 days ago". */
  updated: string;
  description: string;
}

export interface ListDetailPageProps {
  projects: Project[];
  /** Runs after the person confirms. A thrown error is shown in the dialog. */
  onDelete: (id: string) => void | Promise<void>;
}

const STATUS_VARIANT: Record<ProjectStatus, BadgeVariant> = {
  active: "default",
  paused: "secondary",
  archived: "outline",
};

/**
 * A collection beside the selected record. The first project is selected until the person
 * picks another, and when the selected one disappears the first is selected again. Swap
 * `Project` for your own record and edit the fields in the detail.
 */
export function ListDetailPage({ projects, onDelete }: ListDetailPageProps) {
  const listId = useId();
  const detailId = useId();
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const selected = projects.find((project) => project.id === selectedId) ?? projects[0];

  return (
    <main {...stylex.props(styles.page)}>
      <h1 {...stylex.props(styles.title)}>Projects</h1>

      {selected === undefined ? (
        <Empty.Root>
          <Empty.Header>
            <h2 {...stylex.props(styles.heading)}>No projects</h2>
            <Empty.Description>Projects you create appear here.</Empty.Description>
          </Empty.Header>
        </Empty.Root>
      ) : (
        <div {...stylex.props(styles.layout)}>
          <section aria-labelledby={listId} {...stylex.props(styles.list)}>
            <h2 id={listId} {...stylex.props(styles.heading)}>
              All projects ({projects.length})
            </h2>
            <nav aria-label="Projects">
              <Item.Group>
                {projects.map((project) => (
                  <Item.Root
                    key={project.id}
                    size="sm"
                    variant={project.id === selected.id ? "muted" : "default"}
                    render={
                      <button
                        type="button"
                        aria-current={project.id === selected.id ? "true" : undefined}
                        onClick={() => setSelectedId(project.id)}
                      />
                    }
                  >
                    <Item.Content>
                      <Item.Title>{project.name}</Item.Title>
                      <Item.Description>{project.owner}</Item.Description>
                    </Item.Content>
                    <Item.Actions>
                      <Badge variant={STATUS_VARIANT[project.status]}>{project.status}</Badge>
                    </Item.Actions>
                  </Item.Root>
                ))}
              </Item.Group>
            </nav>
          </section>

          <section aria-labelledby={detailId} {...stylex.props(styles.detail)}>
            <Card.Root>
              <Card.Header>
                <h2 id={detailId} {...stylex.props(styles.heading)}>
                  {selected.name}
                </h2>
                <Card.Description>{selected.description}</Card.Description>
              </Card.Header>
              <Card.Content>
                <dl {...stylex.props(styles.facts)}>
                  <dt {...stylex.props(styles.term)}>Owner</dt>
                  <dd {...stylex.props(styles.value)}>{selected.owner}</dd>
                  <dt {...stylex.props(styles.term)}>Status</dt>
                  <dd {...stylex.props(styles.value)}>{selected.status}</dd>
                  <dt {...stylex.props(styles.term)}>Updated</dt>
                  <dd {...stylex.props(styles.value)}>{selected.updated}</dd>
                </dl>
              </Card.Content>
              <Card.Footer style={styles.footer}>
                <ConfirmDialog
                  title={`Delete ${selected.name}?`}
                  description="Its files and history are deleted. You can't undo this."
                  confirmLabel="Delete project"
                  destructive
                  onConfirm={() => onDelete(selected.id)}
                >
                  <Button variant="outline">Delete project</Button>
                </ConfirmDialog>
              </Card.Footer>
            </Card.Root>
          </section>
        </div>
      )}
    </main>
  );
}

const styles = stylex.create({
  page: {
    padding: spacing["6"],
    gap: spacing["6"],
    marginInline: "auto",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    fontFamily: typography.fontFamily,
    maxWidth: "64rem",
    width: "100%",
  },
  title: {
    margin: 0,
    color: colors.foreground,
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightSemibold,
    lineHeight: typography.lineHeightLg,
  },
  layout: {
    gap: spacing["6"],
    alignItems: "start",
    display: "flex",
    flexWrap: "wrap",
  },
  list: {
    gap: spacing["3"],
    display: "flex",
    flexBasis: "16rem",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
  detail: {
    flexBasis: "24rem",
    flexGrow: 2,
    minWidth: 0,
  },
  heading: {
    margin: 0,
    color: colors.foreground,
    fontSize: typography.fontSizeBase,
    fontWeight: typography.fontWeightSemibold,
    lineHeight: typography.lineHeightBase,
  },
  facts: {
    margin: 0,
    columnGap: spacing["6"],
    display: "grid",
    gridTemplateColumns: "max-content 1fr",
    rowGap: spacing["2"],
  },
  term: {
    color: colors.mutedForeground,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
  },
  value: {
    margin: 0,
    color: colors.foreground,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
  },
  footer: {
    justifyContent: "flex-end",
  },
});
