import * as stylex from "@stylexjs/stylex";
import { Button } from "@/components/ui/button";
import * as Dialog from "@/components/ui/dialog";
import * as Field from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { spacing } from "@/styles/shelf/tokens.stylex";

export default function DialogDemo() {
  return (
    <Dialog.Root>
      <Dialog.Trigger render={<Button variant="outline" />}>Edit profile</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Edit profile</Dialog.Title>
          <Dialog.Description>Changes are visible to your whole workspace.</Dialog.Description>
        </Dialog.Header>
        <div {...stylex.props(styles.fields)}>
          <Field.Root>
            <Field.Label>Name</Field.Label>
            <Input defaultValue="Ada Lovelace" />
          </Field.Root>
          <Field.Root>
            <Field.Label>Username</Field.Label>
            <Input defaultValue="@ada" />
          </Field.Root>
        </div>
        <Dialog.Footer>
          <Dialog.Close render={<Button variant="outline" />}>Cancel</Dialog.Close>
          <Dialog.Close render={<Button />}>Save changes</Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
}

const styles = stylex.create({
  fields: { gap: spacing["4"], display: "grid" },
});
