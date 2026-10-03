import { Button, Card, Dialog } from "@acme/ui";
import { Badge } from "@/components/ui/badge";
import * as Table from "@/components/ui/table";

const bills = [
  { vendor: "Northwind", amount: "$1,048.25", status: "Due" },
  { vendor: "Contoso", amount: "$259.49", status: "Paid" },
];

export function Bills() {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Title>Bills</Card.Title>
      </Card.Header>
      <Card.Content>
        <Table.Root>
          <Table.Body>
            {bills.map((bill) => (
              <Table.Row key={bill.vendor}>
                <Table.Cell>{bill.vendor}</Table.Cell>
                <Table.Cell>{bill.amount}</Table.Cell>
                <Table.Cell>
                  <Badge>{bill.status}</Badge>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
        <Dialog.Root>
          <Dialog.Trigger render={<Button />}>Pay bills</Dialog.Trigger>
        </Dialog.Root>
      </Card.Content>
    </Card.Root>
  );
}
