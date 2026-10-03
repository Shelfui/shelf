import { expect } from "storybook/test";
import preview from "@/.storybook/preview";
import * as Pagination from "./pagination";

const meta = preview.meta({
  title: "Components/Pagination",
  component: Pagination.Root,
  parameters: { figma: {} },
});

export const Default = meta.story({
  render: () => (
    <Pagination.Root>
      <Pagination.List>
        <Pagination.Item>
          <Pagination.Previous href="?page=1" />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Link href="?page=1">1</Pagination.Link>
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Link href="?page=2" isActive>
            2
          </Pagination.Link>
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Link href="?page=3">3</Pagination.Link>
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Ellipsis />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Next href="?page=3" />
        </Pagination.Item>
      </Pagination.List>
    </Pagination.Root>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    await expect(canvas.getByRole("link", { name: "2" })).toHaveAttribute("aria-current", "page");
    await expect(canvas.getByRole("link", { name: "1" })).not.toHaveAttribute("aria-current");
    await expect(canvas.getByRole("link", { name: "Go to previous page" })).toHaveAttribute(
      "href",
      "?page=1",
    );
    await expect(canvas.getByRole("link", { name: "Go to next page" })).toHaveAttribute(
      "href",
      "?page=3",
    );
  },
});
