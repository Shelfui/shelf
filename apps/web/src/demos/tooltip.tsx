import { Button } from "@/components/ui/button";
import { PlusIcon } from "@/components/ui/icons";
import * as Tooltip from "@/components/ui/tooltip";

export default function TooltipDemo() {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger render={<Button variant="outline" size="icon" aria-label="Add" />}>
        <PlusIcon />
      </Tooltip.Trigger>
      <Tooltip.Content>Add to library</Tooltip.Content>
    </Tooltip.Root>
  );
}
