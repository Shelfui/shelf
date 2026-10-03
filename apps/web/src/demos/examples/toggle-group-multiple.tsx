import { BoldIcon, ItalicIcon, UnderlineIcon } from "@/components/ui/icons";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup } from "@/components/ui/toggle-group";

export default function ToggleGroupMultiple() {
  return (
    <ToggleGroup aria-label="Text formatting" multiple defaultValue={["bold"]}>
      <Toggle value="bold" aria-label="Bold">
        <BoldIcon />
      </Toggle>
      <Toggle value="italic" aria-label="Italic">
        <ItalicIcon />
      </Toggle>
      <Toggle value="underline" aria-label="Underline">
        <UnderlineIcon />
      </Toggle>
    </ToggleGroup>
  );
}
