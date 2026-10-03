import { useEffect } from "react";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import { Button } from "../button/button";
import { ToastProvider, toastManager } from "./toast";

const meta = preview.meta({
  title: "Components/Toast",
  parameters: { figma: { story: "Open", root: "toast" }, a11y: { context: "body" } },
  decorators: [(Story) => <ToastProvider timeout={0}>{Story()}</ToastProvider>],
});

const undone = fn();

const toastOf = (text: string) => screen.getByText(text).closest<HTMLElement>("[data-slot=toast]")!;

const gone = (text: string) => waitFor(() => expect(screen.queryByText(text)).toBeNull());

async function dismiss(text: string) {
  await userEvent.hover(toastOf(text));
  const close = toastOf(text).querySelector<HTMLElement>("[aria-label=Dismiss]")!;
  await userEvent.click(close);
  await gone(text);
}

/** `toastManager.add` shows a toast; its close button dismisses it. */
export const Default = meta.story({
  render: () => (
    <Button
      variant="outline"
      onClick={() =>
        toastManager.add({
          title: "Invoice sent",
          description: "Acme Inc. will get it by email.",
        })
      }
    >
      Send invoice
    </Button>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Send invoice" }));

    await waitFor(() => expect(screen.getByText("Invoice sent")).toBeVisible());
    await expect(screen.getByText("Acme Inc. will get it by email.")).toBeVisible();

    await dismiss("Invoice sent");
  },
});

/** New toasts stack on top of older ones; hovering the stack fans them out. */
export const Stacked = meta.story({
  render: () => (
    <Button
      variant="outline"
      onClick={() => {
        toastManager.add({ title: "Draft saved" });
        toastManager.add({ title: "Invoice sent", description: "Acme Inc. will get it by email." });
        toastManager.add({ title: "Payment received", type: "success" });
      }}
    >
      Show three
    </Button>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Show three" }));
    await waitFor(() => expect(screen.getByText("Payment received")).toBeVisible());

    const front = toastOf("Payment received");
    const back = toastOf("Draft saved");
    await expect(front).not.toHaveAttribute("data-expanded");
    await expect(
      back.compareDocumentPosition(front) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    await userEvent.hover(front);
    await waitFor(() => expect(front).toHaveAttribute("data-expanded"));

    for (const title of ["Payment received", "Invoice sent", "Draft saved"]) await dismiss(title);
  },
});

/** `type: "success"` adds a check icon. */
export const Success = meta.story({
  render: () => (
    <Button
      variant="outline"
      onClick={() => toastManager.add({ title: "Payment received", type: "success" })}
    >
      Receive
    </Button>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Receive" }));
    const toast = await waitFor(() => toastOf("Payment received"));

    await expect(toast.querySelector("[data-slot=toast-icon] svg")).not.toBeNull();

    await dismiss("Payment received");
  },
});

/** `toastManager.promise` shows a loading toast, then turns it into the result. */
export const PromiseToast = meta.story({
  name: "Promise",
  render: () => (
    <Button
      variant="outline"
      onClick={() => {
        void toastManager.promise(new Promise((resolve) => setTimeout(resolve, 400)), {
          loading: "Saving changes…",
          success: "Changes saved",
          error: "Couldn't save",
        });
      }}
    >
      Save
    </Button>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(screen.getByText("Saving changes…")).toBeVisible());
    await expect(toastOf("Saving changes…").querySelector("[data-slot=spinner]")).not.toBeNull();

    await waitFor(() => expect(screen.getByText("Changes saved")).toBeVisible());
    await dismiss("Changes saved");
  },
});

/** An action runs its handler and closes the toast. */
export const WithAction = meta.story({
  render: () => (
    <Button
      variant="outline"
      onClick={() =>
        toastManager.add({
          title: "Invoice archived",
          actionProps: { children: "Undo", onClick: undone },
        })
      }
    >
      Archive
    </Button>
  ),
  play: async ({ canvas }) => {
    undone.mockClear();

    await userEvent.click(canvas.getByRole("button", { name: "Archive" }));
    await userEvent.click(await screen.findByRole("button", { name: "Undo" }));

    await expect(undone).toHaveBeenCalledTimes(1);
  },
});

export const Error = meta.story({
  render: () => (
    <Button
      variant="outline"
      onClick={() =>
        toastManager.add({
          title: "Payment failed",
          description: "The card was declined.",
          type: "error",
        })
      }
    >
      Pay
    </Button>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Pay" }));

    await expect(getComputedStyle(await screen.findByText("Payment failed")).color).toBe(
      "oklch(0.5 0.2 27.3)",
    );

    await dismiss("Payment failed");
  },
});

function Shown() {
  useEffect(() => {
    let id: string | undefined;
    // The provider subscribes in its own effect, which runs after this one.
    const timer = setTimeout(() => {
      id = toastManager.add({
        title: "Invoice sent",
        description: "Acme Inc. will get it by email.",
      });
    });
    return () => {
      clearTimeout(timer);
      if (id) toastManager.close(id);
    };
  }, []);
  return null;
}

/** A toast on screen, without a trigger. */
export const Open = meta.story({
  render: () => <Shown />,
  play: async () => {
    await waitFor(() => expect(screen.getByText("Invoice sent")).toBeVisible());
  },
});

export const Dark = meta.story({
  parameters: { themes: { themeOverride: "dark" } },
  render: () => (
    <Button variant="outline" onClick={() => toastManager.add({ title: "Saved" })}>
      Save
    </Button>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    const toast = (await screen.findByText("Saved")).closest<HTMLElement>("[data-slot=toast]");

    await expect(getComputedStyle(toast!).backgroundColor).toBe("rgb(23, 23, 23)");

    await dismiss("Saved");
  },
});
