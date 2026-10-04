"use client";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/patterns/confirm-dialog";

export default function ConfirmDialogDemo() {
  return (
    <ConfirmDialog
      title="Delete project?"
      description="This removes every file in the project and can't be undone."
      confirmLabel="Delete project"
      destructive
      onConfirm={async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }}
    >
      <Button variant="outline">Delete project</Button>
    </ConfirmDialog>
  );
}
