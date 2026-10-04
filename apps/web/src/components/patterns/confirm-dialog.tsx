"use client";

import { type ReactElement, type ReactNode, useState } from "react";
import * as Alert from "@/components/ui/alert";
import * as AlertDialog from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export interface ConfirmDialogProps {
  /** The element that opens the dialog, usually a Button. */
  children: ReactElement;
  title: ReactNode;
  /** What happens, and whether it can be undone. */
  description: ReactNode;
  /** Name the action, such as "Delete project", rather than "OK". */
  confirmLabel?: string;
  cancelLabel?: string;
  /** Styles the confirm button as destructive. */
  destructive?: boolean;
  /**
   * Runs when the person confirms. The dialog stays open and shows a pending state until it
   * settles, closes if it resolves, and shows the error message if it throws.
   */
  onConfirm: () => void | Promise<void>;
}

/**
 * A confirmation for an action that is hard to undo:
 *
 *   <ConfirmDialog
 *     title="Delete project?"
 *     description="This removes every file and can't be undone."
 *     confirmLabel="Delete project"
 *     destructive
 *     onConfirm={() => deleteProject(id)}
 *   >
 *     <Button variant="outline">Delete project</Button>
 *   </ConfirmDialog>
 *
 * While `onConfirm` runs, both buttons are disabled and Escape does nothing, so the action
 * cannot run twice or be abandoned halfway. For a dialog with other content, compose
 * AlertDialog directly.
 */
export function ConfirmDialog({
  children,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setPending(true);
    setError(null);
    try {
      await onConfirm();
      setOpen(false);
    } catch (thrown) {
      setError(
        thrown instanceof Error && thrown.message !== ""
          ? thrown.message
          : "Something went wrong. Try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(next) => {
        if (pending) return;
        if (next) setError(null);
        setOpen(next);
      }}
    >
      <AlertDialog.Trigger render={children} />
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>{title}</AlertDialog.Title>
          <AlertDialog.Description>{description}</AlertDialog.Description>
        </AlertDialog.Header>
        {error !== null && (
          <Alert.Root variant="destructive">
            <Alert.Description>{error}</Alert.Description>
          </Alert.Root>
        )}
        <AlertDialog.Footer>
          <AlertDialog.Close render={<Button variant="outline" disabled={pending} />}>
            {cancelLabel}
          </AlertDialog.Close>
          <Button
            variant={destructive ? "destructive" : "default"}
            disabled={pending}
            focusableWhenDisabled
            onClick={() => void confirm()}
          >
            {pending && <Spinner aria-hidden />}
            {confirmLabel}
          </Button>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
