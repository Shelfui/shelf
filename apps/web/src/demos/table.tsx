import * as stylex from "@stylexjs/stylex";
import { Badge } from "@/components/ui/badge";
import * as Table from "@/components/ui/table";

const INVOICES = [
  { id: "INV-1042", customer: "Acme Inc.", status: "Paid", amount: "$1,200.00" },
  { id: "INV-1043", customer: "Globex", status: "Overdue", amount: "$860.00" },
  { id: "INV-1044", customer: "Initech", status: "Draft", amount: "$2,450.00" },
];

export default function TableDemo() {
  return (
    <Table.Root style={styles.root}>
      <Table.Caption>Recent invoices</Table.Caption>
      <Table.Header>
        <Table.Row>
          <Table.Head>Invoice</Table.Head>
          <Table.Head>Customer</Table.Head>
          <Table.Head>Status</Table.Head>
          <Table.Head style={styles.end}>Amount</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {INVOICES.map((invoice) => (
          <Table.Row key={invoice.id}>
            <Table.Cell>{invoice.id}</Table.Cell>
            <Table.Cell>{invoice.customer}</Table.Cell>
            <Table.Cell>
              <Badge
                variant={
                  invoice.status === "Paid"
                    ? "default"
                    : invoice.status === "Overdue"
                      ? "destructive"
                      : "secondary"
                }
              >
                {invoice.status}
              </Badge>
            </Table.Cell>
            <Table.Cell style={styles.end}>{invoice.amount}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

const styles = stylex.create({
  root: { maxWidth: "36rem" },
  end: { textAlign: "end" },
});
