import { Button } from "./components/ui/button";
import * as DropdownMenu from "./components/ui/dropdown-menu";
import * as Table from "./components/ui/table";
import { ToastProvider } from "./components/ui/toast";

const events = [
  { actor: "ada@acme.com", action: "Invited a user" },
  { actor: "grace@acme.com", action: "Rotated an API key" },
];

export function AuditLog() {
  return (
    <ToastProvider>
      <Table.Root>
        <Table.Body>
          {events.map((event) => (
            <Table.Row key={event.actor}>
              <Table.Cell>{event.actor}</Table.Cell>
              <Table.Cell>{event.action}</Table.Cell>
              <Table.Cell>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger render={<Button variant="ghost" />}>
                    More
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content>
                    <DropdownMenu.Item>Copy event ID</DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </ToastProvider>
  );
}
