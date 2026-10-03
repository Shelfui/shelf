import { Button } from "@/components/ui/button";
import { BoldIcon, ItalicIcon, UnderlineIcon } from "@/components/ui/icons";
import { Toggle } from "@/components/ui/toggle";
import * as Toolbar from "@/components/ui/toolbar";

export default function ToolbarDemo() {
  return (
    <Toolbar.Root aria-label="Formatting">
      <Toolbar.Group aria-label="Text style">
        <Toolbar.Button render={<Toggle size="sm" aria-label="Bold" />}>
          <BoldIcon />
        </Toolbar.Button>
        <Toolbar.Button render={<Toggle size="sm" aria-label="Italic" />}>
          <ItalicIcon />
        </Toolbar.Button>
        <Toolbar.Button render={<Toggle size="sm" aria-label="Underline" />}>
          <UnderlineIcon />
        </Toolbar.Button>
      </Toolbar.Group>
      <Toolbar.Separator />
      <Toolbar.Button render={<Button variant="ghost" size="sm" />}>Share</Toolbar.Button>
    </Toolbar.Root>
  );
}
