import { LoginForm } from "./components/blocks/login-form";
import { Button } from "./components/ui/button";
import * as Card from "./components/ui/card";
import * as Tabs from "./components/ui/tabs";

export function Pricing() {
  return (
    <Tabs.Root defaultValue="monthly">
      <Tabs.List>
        <Tabs.Tab value="monthly">Monthly</Tabs.Tab>
        <Tabs.Tab value="yearly">Yearly</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="monthly">
        <Card.Root>
          <Card.Header>
            <Card.Title>Team</Card.Title>
          </Card.Header>
          <Card.Footer>
            <Button>Start trial</Button>
          </Card.Footer>
        </Card.Root>
      </Tabs.Panel>
      <LoginForm />
    </Tabs.Root>
  );
}
