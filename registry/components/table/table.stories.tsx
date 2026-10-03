import { expect } from "storybook/test";
import preview from "@/.storybook/preview";
import * as Table from "./table";

const meta = preview.meta({
  title: "Components/Table",
  component: Table.Root,
  parameters: { figma: {} },
});

const INVOICES = [
  { id: "INV-001", customer: "Acme Inc.", amount: "$1,200.00" },
  { id: "INV-002", customer: "Globex", amount: "$860.00" },
  { id: "INV-003", customer: "Initech", amount: "$2,450.00" },
];

export const Default = meta.story({
  render: () => (
    <Table.Root>
      <Table.Caption>Recent invoices</Table.Caption>
      <Table.Header>
        <Table.Row>
          <Table.Head>Invoice</Table.Head>
          <Table.Head>Customer</Table.Head>
          <Table.Head>Amount</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {INVOICES.map((invoice) => (
          <Table.Row key={invoice.id}>
            <Table.Cell>{invoice.id}</Table.Cell>
            <Table.Cell>{invoice.customer}</Table.Cell>
            <Table.Cell>{invoice.amount}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  ),
  play: async ({ canvas }) => {
    const table = canvas.getByRole("table", { name: "Recent invoices" });

    await expect(canvas.getAllByRole("columnheader")).toHaveLength(3);
    await expect(canvas.getAllByRole("row")).toHaveLength(4);
    await expect(table).toBeVisible();
  },
});
