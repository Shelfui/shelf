import { expect, userEvent } from "storybook/test";
import preview from "@/.storybook/preview";
import { Sources } from "./sources";

const meta = preview.meta({
  title: "Components/Sources",
  component: Sources,
  parameters: { layout: "padded" },
});

export const Default = meta.story({
  args: {
    sources: [
      { type: "source-url", sourceId: "a", url: "https://example.com/a", title: "Annual report" },
      { type: "source-url", sourceId: "b", url: "https://example.org/b", title: "Press release" },
      { type: "source-url", sourceId: "c", url: "javascript:alert(1)", title: "Not a link" },
    ],
  },
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: "Used 3 sources" });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger);
    await expect(await canvas.findByRole("link", { name: "Annual report" })).toHaveAttribute(
      "href",
      "https://example.com/a",
    );
    await expect(canvas.getAllByRole("link")).toHaveLength(2);
  },
});
