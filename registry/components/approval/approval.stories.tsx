import { expect, fn, userEvent } from "storybook/test";
import preview from "@/.storybook/preview";
import { Approval } from "./approval";

const meta = preview.meta({
  title: "Components/Approval",
  component: Approval,
  args: { onRespond: fn() },
  parameters: { layout: "padded" },
});

export const Default = meta.story({
  args: { children: "Allow deleteFile to remove report.pdf?" },
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole("group", { name: /deleteFile/ })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Deny" }));
    await expect(args.onRespond).toHaveBeenLastCalledWith(false);
    await userEvent.click(canvas.getByRole("button", { name: "Approve" }));
    await expect(args.onRespond).toHaveBeenLastCalledWith(true);
  },
});
