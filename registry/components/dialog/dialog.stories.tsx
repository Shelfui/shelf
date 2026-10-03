import { expect, fn, screen, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import { Button } from "../button/button";
import * as Dialog from "./dialog";

const meta = preview.meta({
  title: "Components/Dialog",
  // The dialog renders in a portal on <body>, outside the story root.
  parameters: { figma: { story: "Open", root: "dialog-content" }, a11y: { context: "body" } },
});

const deleted = fn();

function DeleteProject({ defaultOpen = false }: { defaultOpen?: boolean }) {
  return (
    <Dialog.Root defaultOpen={defaultOpen}>
      <Dialog.Trigger render={<Button variant="outline" />}>Delete project</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Delete project?</Dialog.Title>
          <Dialog.Description>
            This removes the project and its invoices. You can't undo this.
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Dialog.Close render={<Button variant="outline" />}>Cancel</Dialog.Close>
          <Dialog.Close render={<Button variant="destructive" onClick={deleted} />}>
            Delete
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
}

const backdrop = () => document.querySelector<HTMLElement>('[data-slot="dialog-backdrop"]');

/** Base UI moves focus asynchronously, on open and when Tab wraps through its focus guards. */
const focused = (element: HTMLElement) => waitFor(() => expect(element).toHaveFocus());

/** Waits for the dialog to finish closing, including its exit transition. */
const closed = () =>
  waitFor(() => {
    if (screen.queryByRole("dialog")) throw new Error("dialog is still open");
  });

/** Opens from its trigger, is named by its title and description, and restores focus on close. */
export const Default = meta.story({
  render: () => <DeleteProject />,
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: "Delete project" });

    await userEvent.click(trigger);
    const dialog = await screen.findByRole("dialog", { name: "Delete project?" });

    await expect(dialog).toHaveAccessibleDescription(
      "This removes the project and its invoices. You can't undo this.",
    );
    await focused(screen.getByRole("button", { name: "Cancel" }));

    await userEvent.keyboard("{Escape}");
    await closed();

    await focused(trigger);
  },
});

/** Open, so accessibility checks run against the dialog itself. */
export const Open = meta.story({
  render: () => <DeleteProject defaultOpen />,
  play: async () => {
    const dialog = await screen.findByRole("dialog");

    await expect(dialog).toBeVisible();
    await expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  },
});

/** Tab and Shift+Tab stay inside the dialog while it is open. */
export const FocusTrap = meta.story({
  render: () => <DeleteProject defaultOpen />,
  play: async () => {
    await screen.findByRole("dialog");
    const cancel = screen.getByRole("button", { name: "Cancel" });
    const remove = screen.getByRole("button", { name: "Delete" });
    const close = screen.getByRole("button", { name: "Close" });

    await focused(cancel);

    await userEvent.tab();
    await focused(remove);

    await userEvent.tab();
    await focused(close);

    await userEvent.tab();
    await focused(cancel);

    await userEvent.tab({ shift: true });
    await focused(close);
  },
});

export const DismissOnBackdrop = meta.story({
  render: () => <DeleteProject />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Delete project" }));
    await screen.findByRole("dialog");

    await userEvent.click(backdrop()!);
    await closed();

    await expect(screen.queryByRole("dialog")).toBeNull();
  },
});

/** Footer actions are Shelf Buttons rendered as `Dialog.Close`, so they run and then close. */
export const Actions = meta.story({
  render: () => <DeleteProject />,
  play: async ({ canvas }) => {
    deleted.mockClear();

    await userEvent.click(canvas.getByRole("button", { name: "Delete project" }));
    await screen.findByRole("dialog");

    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    await closed();

    await expect(deleted).toHaveBeenCalledTimes(1);
  },
});

export const WithoutCloseButton = meta.story({
  render: () => (
    <Dialog.Root defaultOpen>
      <Dialog.Content showCloseButton={false}>
        <Dialog.Header>
          <Dialog.Title>Invoice sent</Dialog.Title>
          <Dialog.Description>We emailed the invoice to your customer.</Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Dialog.Close render={<Button />}>Done</Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  ),
  play: async () => {
    await screen.findByRole("dialog", { name: "Invoice sent" });

    await expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
    await focused(screen.getByRole("button", { name: "Done" }));
  },
});

/** The theme is on <html>, so the portaled dialog and its backdrop are dark too. */
export const Dark = meta.story({
  parameters: { themes: { themeOverride: "dark" } },
  render: () => <DeleteProject defaultOpen />,
  play: async () => {
    const dialog = await screen.findByRole("dialog");
    const description = screen.getByText(/removes the project/);

    await expect(getComputedStyle(dialog).backgroundColor).toBe("rgb(10, 10, 10)");
    await expect(getComputedStyle(dialog).borderTopColor).toBe("rgb(38, 38, 38)");
    await expect(getComputedStyle(description).color).toBe("rgb(161, 161, 161)");
    await expect(getComputedStyle(backdrop()!).backgroundColor).toBe("rgba(0, 0, 0, 0.6)");
  },
});
