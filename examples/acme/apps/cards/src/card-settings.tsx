import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Switch } from "./components/ui/switch";
import * as Tooltip from "./components/ui/tooltip";

export function CardSettings() {
  return (
    <section>
      <Badge>Virtual</Badge>
      <label>
        <Switch defaultChecked /> Online payments
      </label>
      <Tooltip.Root>
        <Tooltip.Trigger render={<Button variant="outline">Freeze card</Button>} />
        <Tooltip.Content>Stops new charges until you unfreeze it.</Tooltip.Content>
      </Tooltip.Root>
    </section>
  );
}
