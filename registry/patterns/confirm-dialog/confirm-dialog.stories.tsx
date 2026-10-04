import { expect, fn, screen, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import { Button } from "../../components/button/button";
import { ConfirmDialog } from "./confirm-dialog";

const meta = preview.meta({
  title: "Patterns/Confirm Dialog",
  component: ConfirmDialog,
  parameters: { a11y: { context: "body" } },
});

const closed = () =>
  waitFor(() => {
    if (screen.queryByRole("alertdialog")) throw new Error("alert dialog is still open");
  });

function DeleteProject({ onConfirm }: { onConfirm: () => void | Promise<void> }) {
  return (
    <ConfirmDialog
      title="Delete project?"
      description="This removes every file in the project and can't be undone."
      confirmLabel="Delete project"
      destructive
      onConfirm={onConfirm}
    >
      <Button variant="outline">Delete project</Button>
    </ConfirmDialog>
  );
}

const deleted = fn();

/** Confirming runs the action, closes the dialog, and returns focus to the trigger. */
export const Default = meta.story({
  render: () => <DeleteProject onConfirm={deleted} />,
  play: async ({ canvas }) => {
    deleted.mockClear();
    const trigger = canvas.getByRole("button", { name: "Delete project" });

    await userEvent.click(trigger);
    const dialog = await screen.findByRole("alertdialog", { name: "Delete project?" });
    await expect(dialog).toHaveAccessibleDescription(
      "This removes every file in the project and can't be undone.",
    );

    await userEvent.click(screen.getByRole("button", { name: "Delete project" }));
    await closed();

    await expect(deleted).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(trigger).toHaveFocus());
  },
});

/** Cancelling closes the dialog without running the action. */
export const Cancel = meta.story({
  render: () => <DeleteProject onConfirm={deleted} />,
  play: async ({ canvas }) => {
    deleted.mockClear();
    await userEvent.click(canvas.getByRole("button", { name: "Delete project" }));
    await screen.findByRole("alertdialog");

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await closed();

    await expect(deleted).not.toHaveBeenCalled();
  },
});

let release: () => void = () => {};
const slow = () => new Promise<void>((resolve) => (release = resolve));

/**
 * While the action runs, both buttons are disabled and Escape does not close the dialog,
 * so the action can't run twice or be abandoned. It closes when the action finishes.
 */
export const Pending = meta.story({
  render: () => <DeleteProject onConfirm={slow} />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Delete project" }));
    await screen.findByRole("alertdialog");

    const confirm = screen.getByRole("button", { name: "Delete project" });
    await userEvent.click(confirm);

    await expect(confirm).toHaveAttribute("aria-disabled", "true");
    await expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    await userEvent.keyboard("{Escape}");
    await expect(screen.getByRole("alertdialog")).toBeVisible();

    release();
    await closed();
  },
});

let attempts = 0;
const flaky = () => {
  attempts += 1;
  if (attempts === 1) throw new Error("The project is locked by another deploy.");
};

/** If the action throws, the dialog stays open and says why, and the person can try again. */
export const Failed = meta.story({
  render: () => <DeleteProject onConfirm={flaky} />,
  play: async ({ canvas }) => {
    attempts = 0;
    await userEvent.click(canvas.getByRole("button", { name: "Delete project" }));
    await screen.findByRole("alertdialog");

    await userEvent.click(screen.getByRole("button", { name: "Delete project" }));
    await expect(await screen.findByRole("alert")).toHaveTextContent(
      "The project is locked by another deploy.",
    );
    await expect(screen.getByRole("alertdialog")).toBeVisible();
    await expect(screen.getByRole("button", { name: "Delete project" })).toBeEnabled();

    await userEvent.click(screen.getByRole("button", { name: "Delete project" }));
    await closed();
  },
});
