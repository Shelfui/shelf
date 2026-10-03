import { Card, Tabs } from "@acme/ui";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import * as Dialog from "./components/ui/dialog";
import * as Table from "./components/ui/table";

const invoices = [
  { number: "INV-1042", customer: "Northwind", status: "Sent" },
  { number: "INV-1041", customer: "Contoso", status: "Paid" },
];

export function Invoices() {
  return (
    <Card.Root>
      <Tabs.Root defaultValue="open">
        <Tabs.List>
          <Tabs.Tab value="open">Open</Tabs.Tab>
          <Tabs.Tab value="paid">Paid</Tabs.Tab>
        </Tabs.List>
      </Tabs.Root>
      <Table.Root>
        <Table.Body>
          {invoices.map((invoice) => (
            <Table.Row key={invoice.number}>
              <Table.Cell>{invoice.number}</Table.Cell>
              <Table.Cell>{invoice.customer}</Table.Cell>
              <Table.Cell>
                <Badge>{invoice.status}</Badge>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <Dialog.Root>
        <Dialog.Trigger render={<Button />}>New invoice</Dialog.Trigger>
      </Dialog.Root>
    </Card.Root>
  );
}
