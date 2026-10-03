import { expect, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import { Input } from "../input/input";
import * as Field from "./field";

const meta = preview.meta({
  title: "Components/Field",
  component: Field.Root,
  parameters: { figma: {} },
});

/** The label names the control and the description describes it, with no ids to wire up. */
export const Default = meta.story({
  render: () => (
    <Field.Root>
      <Field.Label>Company name</Field.Label>
      <Input placeholder="Acme Inc." />
      <Field.Description>Shown on your invoices.</Field.Description>
    </Field.Root>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Company name" });

    await expect(input).toHaveAccessibleDescription("Shown on your invoices.");
  },
});

/**
 * Validation runs on blur once the value has changed, so tabbing through an empty field
 * does not flag it. The error appears, the label turns red, and both clear once fixed.
 */
export const Validation = meta.story({
  render: () => (
    <Field.Root validationMode="onBlur">
      <Field.Label>Email</Field.Label>
      <Input type="email" required />
      <Field.Error match="valueMissing">Enter your email.</Field.Error>
      <Field.Error match="typeMismatch">Enter a valid email.</Field.Error>
    </Field.Root>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Email" });

    await userEvent.click(input);
    await userEvent.tab();

    await expect(input).not.toHaveAttribute("aria-invalid");

    await userEvent.type(input, "ada");
    await userEvent.tab();

    await expect(await canvas.findByText("Enter a valid email.")).toBeVisible();
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(getComputedStyle(canvas.getByText("Email")).color).toBe("oklch(0.5 0.2 27.3)");

    await userEvent.clear(input);
    await userEvent.tab();

    await expect(await canvas.findByText("Enter your email.")).toBeVisible();

    await userEvent.type(input, "ada@example.com");
    await userEvent.tab();

    await waitFor(() => expect(input).not.toHaveAttribute("aria-invalid"));
    await expect(canvas.queryByText(/Enter a valid email/)).toBeNull();
  },
});

export const Disabled = meta.story({
  render: () => (
    <Field.Root disabled>
      <Field.Label>Workspace</Field.Label>
      <Input defaultValue="acme" />
    </Field.Root>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("textbox", { name: "Workspace" })).toBeDisabled();
  },
});
