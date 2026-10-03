import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon } from "@/components/ui/icons";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup } from "@/components/ui/toggle-group";

export default function ToggleGroupDemo() {
  return (
    <ToggleGroup aria-label="Text alignment" defaultValue={["left"]}>
      <Toggle value="left" aria-label="Align left">
        <AlignLeftIcon />
      </Toggle>
      <Toggle value="center" aria-label="Align center">
        <AlignCenterIcon />
      </Toggle>
      <Toggle value="right" aria-label="Align right">
        <AlignRightIcon />
      </Toggle>
    </ToggleGroup>
  );
}
