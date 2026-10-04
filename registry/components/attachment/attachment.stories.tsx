import { expect, fn, userEvent } from "storybook/test";
import preview from "@/.storybook/preview";
import { Attachment } from "./attachment";

const meta = preview.meta({
  title: "Components/Attachment",
  component: Attachment,
  parameters: { layout: "padded" },
});

export const Default = meta.story({
  args: { name: "quarterly-report-final-v2.pdf", onRemove: fn() },
  play: async ({ canvas, args }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Remove quarterly-report-final-v2.pdf" }),
    );
    await expect(args.onRemove).toHaveBeenCalledTimes(1);
  },
});

export const WithoutRemove = meta.story({ args: { name: "notes.txt" } });
