import { expect, userEvent } from "storybook/test";
import preview from "@/.storybook/preview";
import * as Field from "../field/field";
import { Textarea } from "./textarea";

const meta = preview.meta({
  title: "Components/Textarea",
  component: Textarea,
  args: { "aria-label": "Message", placeholder: "Type your message here." },
  argTypes: {
    disabled: { control: "boolean" },
  },
  parameters: { figma: { states: ["focus-visible"] } },
});

export const Default = meta.story({
  play: async ({ canvas }) => {
    const textarea = canvas.getByRole("textbox", { name: "Message" });

    await userEvent.type(textarea, "Hello{enter}there");

    await expect(textarea).toHaveValue("Hello\nthere");
  },
});

/** Inside a Field it is labelled and described like any other control. */
export const InField = meta.story({
  render: () => (
    <Field.Root>
      <Field.Label>Notes</Field.Label>
      <Textarea placeholder="Anything we should know?" />
      <Field.Description>Shown on the invoice.</Field.Description>
    </Field.Root>
  ),
  play: async ({ canvas }) => {
    const textarea = canvas.getByRole("textbox", { name: "Notes" });

    await expect(textarea.tagName).toBe("TEXTAREA");
    await expect(textarea).toHaveAccessibleDescription("Shown on the invoice.");
  },
});

export const Disabled = meta.story({
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("textbox")).toBeDisabled();
  },
});
