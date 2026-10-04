import { useState } from "react";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import preview from "@/.storybook/preview";
import { ListDetailPage, type Project } from "./list-detail-page";

const meta = preview.meta({
  title: "Templates/List Detail Page",
  component: ListDetailPage,
  // The confirmation dialog renders in a portal on <body>.
  parameters: { layout: "fullscreen", a11y: { context: "body" } },
});

const PROJECTS: Project[] = [
  {
    id: "atlas",
    name: "Atlas",
    owner: "Ada Lovelace",
    status: "active",
    updated: "2 days ago",
    description: "The customer-facing web app.",
  },
  {
    id: "beacon",
    name: "Beacon",
    owner: "Grace Hopper",
    status: "paused",
    updated: "3 weeks ago",
    description: "Alerting and on-call schedules.",
  },
  {
    id: "cinder",
    name: "Cinder",
    owner: "Alan Turing",
    status: "archived",
    updated: "8 months ago",
    description: "The retired batch importer.",
  },
];

/** Selecting a project in the list shows its details. The first one starts selected. */
export const Default = meta.story({
  args: { projects: PROJECTS, onDelete: () => {} },
  play: async ({ canvas }) => {
    const list = within(canvas.getByRole("navigation", { name: "Projects" }));
    await expect(list.getByRole("button", { name: /Atlas/ })).toHaveAttribute(
      "aria-current",
      "true",
    );
    await expect(canvas.getByRole("heading", { level: 2, name: "Atlas" })).toBeVisible();

    await userEvent.click(list.getByRole("button", { name: /Beacon/ }));

    await expect(canvas.getByRole("heading", { level: 2, name: "Beacon" })).toBeVisible();
    await expect(list.getByRole("button", { name: /Beacon/ })).toHaveAttribute(
      "aria-current",
      "true",
    );
    await expect(list.getByRole("button", { name: /Atlas/ })).not.toHaveAttribute("aria-current");
  },
});

function Deletable() {
  const [projects, setProjects] = useState(PROJECTS);
  return (
    <ListDetailPage
      projects={projects}
      onDelete={(id) => setProjects((current) => current.filter((project) => project.id !== id))}
    />
  );
}

/** Deleting asks first, removes the project, and selects the first one that is left. */
export const Delete = meta.story({
  render: () => <Deletable />,
  play: async ({ canvas }) => {
    const list = within(canvas.getByRole("navigation", { name: "Projects" }));
    await userEvent.click(list.getByRole("button", { name: /Beacon/ }));
    await userEvent.click(canvas.getByRole("button", { name: "Delete project" }));
    await screen.findByRole("alertdialog", { name: "Delete Beacon?" });
    await userEvent.click(screen.getByRole("button", { name: "Delete project" }));

    await waitFor(() => expect(list.queryByRole("button", { name: /Beacon/ })).toBeNull());
    await expect(canvas.getByRole("heading", { level: 2, name: "Atlas" })).toBeVisible();
    await expect(canvas.getByRole("heading", { level: 2, name: "All projects (2)" })).toBeVisible();
  },
});

/** With nothing to select, the page says so instead of showing an empty detail. */
export const Empty = meta.story({
  args: { projects: [], onDelete: () => {} },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { name: "No projects" })).toBeVisible();
    await expect(canvas.queryByRole("navigation", { name: "Projects" })).toBeNull();
  },
});
