import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import * as DropdownMenu from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from "@/components/ui/icons";

export default function ButtonGroupSplit() {
  return (
    <ButtonGroup aria-label="Send invoice">
      <Button>Send invoice</Button>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger render={<Button size="icon" aria-label="More send options" />}>
          <ChevronDownIcon />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          <DropdownMenu.Item>Schedule send</DropdownMenu.Item>
          <DropdownMenu.Item>Send a test to me</DropdownMenu.Item>
          <DropdownMenu.Item>Save as draft</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </ButtonGroup>
  );
}
