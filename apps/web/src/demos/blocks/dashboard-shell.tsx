"use client";

import { DashboardOverview } from "@/components/blocks/dashboard-overview";
import { DashboardShell } from "@/components/blocks/dashboard-shell";

export default function DashboardShellDemo() {
  return (
    <DashboardShell page="Home">
      <DashboardOverview />
    </DashboardShell>
  );
}
