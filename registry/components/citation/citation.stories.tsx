import { expect } from "storybook/test";
import preview from "@/.storybook/preview";
import { Citation } from "./citation";

const meta = preview.meta({
  title: "Components/Citation",
  component: Citation,
  parameters: { layout: "padded" },
});

export const Default = meta.story({
  args: { index: 1, href: "https://example.com/report", title: "Annual report" },
  render: (args) => (
    <p>
      Revenue grew 12% last year.
      <Citation {...args} />
    </p>
  ),
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", { name: "Source 1: Annual report" });
    await expect(link).toHaveAttribute("href", "https://example.com/report");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer nofollow");
  },
});

/** A `javascript:` URL from the model never becomes a link. */
export const UnsafeUrl = meta.story({
  args: { index: 2, href: "javascript:alert(1)" },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole("link")).toBeNull();
    await expect(canvas.getByText("2")).toBeVisible();
  },
});
