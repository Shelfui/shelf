import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup } from "@/components/ui/toggle-group";

export default function ToggleGroupOutline() {
  return (
    <ToggleGroup aria-label="Period" defaultValue={["month"]}>
      <Toggle value="week" variant="outline" size="sm">
        Week
      </Toggle>
      <Toggle value="month" variant="outline" size="sm">
        Month
      </Toggle>
      <Toggle value="year" variant="outline" size="sm">
        Year
      </Toggle>
    </ToggleGroup>
  );
}
