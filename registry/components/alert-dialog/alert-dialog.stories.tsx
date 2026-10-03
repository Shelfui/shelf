import { expect, fn, screen, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import { Button } from "../button/button";
import * as AlertDialog from "./alert-dialog";

const meta = preview.meta({
  title: "Components/Alert Dialog",
  parameters: { figma: { story: "Open", root: "alert-dialog-content" }, a11y: { context: "body" } },
});

const deleted = fn();

function DeleteInvoice({ defaultOpen = false }: { defaultOpen?: boolean }) {
  return (
    <AlertDialog.Root defaultOpen={defaultOpen}>
      <AlertDialog.Trigger render={<Button variant="destructive" />}>
        Delete invoice
      </AlertDialog.Trigger>
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>Delete invoice?</AlertDialog.Title>
          <AlertDialog.Description>
            The customer keeps their copy, but you can't undo this.
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Close render={<Button variant="outline" />}>Cancel</AlertDialog.Close>
          <AlertDialog.Close render={<Button variant="destructive" onClick={deleted} />}>
            Delete
          </AlertDialog.Close>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}

const closed = () =>
  waitFor(() => {
    if (screen.queryByRole("alertdialog")) throw new Error("alert dialog is still open");
  });

/** Opens as an `alertdialog`, named and described, and returns focus on close. */
export const Default = meta.story({
  render: () => <DeleteInvoice />,
  play: async ({ canvas }) => {
    deleted.mockClear();
    const trigger = canvas.getByRole("button", { name: "Delete invoice" });

    await userEvent.click(trigger);
    const dialog = await screen.findByRole("alertdialog", { name: "Delete invoice?" });

    await expect(dialog).toHaveAccessibleDescription(
      "The customer keeps their copy, but you can't undo this.",
    );

    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    await closed();

    await expect(deleted).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(trigger).toHaveFocus());
  },
});

/** Clicking outside does not dismiss it; the user has to choose. */
export const RequiresAChoice = meta.story({
  render: () => <DeleteInvoice defaultOpen />,
  play: async () => {
    await screen.findByRole("alertdialog");
    const backdrop = document.querySelector<HTMLElement>("[data-slot=alert-dialog-backdrop]");

    await userEvent.click(backdrop!);

    await expect(screen.getByRole("alertdialog")).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await closed();
  },
});

/** Open, showing its content. */
export const Open = meta.story({
  render: () => <DeleteInvoice defaultOpen />,
});

export const Dark = meta.story({
  parameters: { themes: { themeOverride: "dark" } },
  render: () => <DeleteInvoice defaultOpen />,
  play: async () => {
    const dialog = await screen.findByRole("alertdialog");

    await expect(getComputedStyle(dialog).backgroundColor).toBe("rgb(10, 10, 10)");
  },
});
