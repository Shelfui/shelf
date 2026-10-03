import { expect } from "storybook/test";
import preview from "@/.storybook/preview";
import * as Field from "../field/field";
import { Input } from "../input/input";
import * as Fieldset from "./fieldset";

const meta = preview.meta({
  title: "Components/Fieldset",
  component: Fieldset.Root,
  parameters: { figma: {} },
});

function Billing({ disabled = false }: { disabled?: boolean }) {
  return (
    <Fieldset.Root disabled={disabled}>
      <Fieldset.Legend>Billing details</Fieldset.Legend>
      <Field.Root>
        <Field.Label>Company</Field.Label>
        <Input />
      </Field.Root>
      <Field.Root>
        <Field.Label>VAT number</Field.Label>
        <Input />
      </Field.Root>
    </Fieldset.Root>
  );
}

export const Default = meta.story({
  render: () => <Billing />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("group", { name: "Billing details" })).toBeInTheDocument();
  },
});

/** Disabling the fieldset disables every field in it. */
export const Disabled = meta.story({
  render: () => <Billing disabled />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("textbox", { name: "Company" })).toBeDisabled();
    await expect(canvas.getByRole("textbox", { name: "VAT number" })).toBeDisabled();
  },
});
