import * as stylex from "@stylexjs/stylex";
import { Button } from "@/components/ui/button";
import * as Field from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import * as Popover from "@/components/ui/popover";
import { spacing } from "@/styles/shelf/tokens.stylex";

export default function PopoverDemo() {
  return (
    <Popover.Root>
      <Popover.Trigger render={<Button variant="outline" />}>Dimensions</Popover.Trigger>
      <Popover.Content>
        <Popover.Header>
          <Popover.Title>Dimensions</Popover.Title>
          <Popover.Description>Set the size of the layer.</Popover.Description>
        </Popover.Header>
        <div {...stylex.props(styles.fields)}>
          <Field.Root>
            <Field.Label>Width</Field.Label>
            <Input defaultValue="100%" />
          </Field.Root>
          <Field.Root>
            <Field.Label>Height</Field.Label>
            <Input defaultValue="25px" />
          </Field.Root>
        </div>
      </Popover.Content>
    </Popover.Root>
  );
}

const styles = stylex.create({
  fields: { gap: spacing["3"], display: "grid", gridTemplateColumns: "1fr 1fr" },
});
