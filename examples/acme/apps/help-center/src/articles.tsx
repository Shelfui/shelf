import * as Accordion from "./components/ui/accordion";
import { Button } from "./components/ui/button";
import * as Card from "./components/ui/card";

export function Articles() {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Title>Popular questions</Card.Title>
      </Card.Header>
      <Card.Content>
        <Accordion.Root>
          <Accordion.Item value="refunds">
            <Accordion.Trigger>How do refunds work?</Accordion.Trigger>
            <Accordion.Panel>Refunds post in 5 to 10 business days.</Accordion.Panel>
          </Accordion.Item>
        </Accordion.Root>
      </Card.Content>
      <Card.Footer>
        <Button variant="outline">Contact support</Button>
      </Card.Footer>
    </Card.Root>
  );
}
