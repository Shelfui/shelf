import { Button, Tabs } from "@acme/ui";

export function Users() {
  return (
    <Tabs.Root defaultValue="active">
      <Tabs.List>
        <Tabs.Tab value="active">Active</Tabs.Tab>
        <Tabs.Tab value="invited">Invited</Tabs.Tab>
      </Tabs.List>
      <Button variant="outline">Invite</Button>
    </Tabs.Root>
  );
}
