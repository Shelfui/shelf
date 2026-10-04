"use client";

import { useState } from "react";
import { ListDetailPage, type Project } from "@/components/templates/list-detail-page";

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

export default function ListDetailPageDemo() {
  const [projects, setProjects] = useState(PROJECTS);
  return (
    <ListDetailPage
      projects={projects}
      onDelete={(id) => setProjects((current) => current.filter((project) => project.id !== id))}
    />
  );
}
