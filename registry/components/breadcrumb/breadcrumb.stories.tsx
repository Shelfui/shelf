import { expect } from "storybook/test";
import preview from "@/.storybook/preview";
import * as Breadcrumb from "./breadcrumb";

const meta = preview.meta({
  title: "Components/Breadcrumb",
  component: Breadcrumb.Root,
  parameters: { figma: {} },
});

export const Default = meta.story({
  render: () => (
    <Breadcrumb.Root>
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#home">Home</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>
          <Breadcrumb.Ellipsis>More pages</Breadcrumb.Ellipsis>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#invoices">Invoices</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>
          <Breadcrumb.Page>INV-001</Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb.Root>
  ),
  play: async ({ canvas }) => {
    const nav = canvas.getByRole("navigation", { name: "Breadcrumb" });

    await expect(canvas.getAllByRole("listitem")).toHaveLength(4);
    await expect(canvas.getByText("INV-001")).toHaveAttribute("aria-current", "page");
    await expect(canvas.getByText("More pages")).toBeInTheDocument();
    await expect(
      nav.querySelectorAll("[data-slot=breadcrumb-separator][aria-hidden=true]"),
    ).toHaveLength(3);
  },
});
