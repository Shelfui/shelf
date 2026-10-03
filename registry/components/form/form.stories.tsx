import { useState } from "react";
import { expect, fn, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import { Button } from "../button/button";
import * as Field from "../field/field";
import { Input } from "../input/input";
import { Form } from "./form";

const meta = preview.meta({
  title: "Components/Form",
  component: Form,
  parameters: { figma: {} },
});

const submitted = fn();

function SignUp({ serverErrors }: { serverErrors?: Record<string, string> }) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  return (
    <Form
      errors={errors}
      onFormSubmit={(values) => {
        submitted(values);
        if (serverErrors) setErrors(serverErrors);
      }}
    >
      <Field.Root name="name">
        <Field.Label>Name</Field.Label>
        <Input required />
        <Field.Error match="valueMissing">Enter your name.</Field.Error>
      </Field.Root>
      <Field.Root name="email">
        <Field.Label>Email</Field.Label>
        <Input type="email" required />
        <Field.Error match="valueMissing">Enter your email.</Field.Error>
        <Field.Error />
      </Field.Root>
      <Button type="submit">Create account</Button>
    </Form>
  );
}

/** Submitting validates every field, shows the errors, and focuses the first invalid one. */
export const Default = meta.story({
  render: () => <SignUp />,
  play: async ({ canvas }) => {
    submitted.mockClear();

    await userEvent.click(canvas.getByRole("button", { name: "Create account" }));

    await expect(await canvas.findByText("Enter your name.")).toBeVisible();
    await expect(canvas.getByText("Enter your email.")).toBeVisible();
    await expect(canvas.getByRole("textbox", { name: "Name" })).toHaveFocus();
    await expect(submitted).not.toHaveBeenCalled();

    await userEvent.type(canvas.getByRole("textbox", { name: "Name" }), "Ada");
    await userEvent.type(canvas.getByRole("textbox", { name: "Email" }), "ada@example.com");
    await userEvent.click(canvas.getByRole("button", { name: "Create account" }));

    await expect(submitted).toHaveBeenCalledWith({ name: "Ada", email: "ada@example.com" });
  },
});

/** Errors from the server, keyed by field name, show on the matching field. */
export const ServerErrors = meta.story({
  render: () => <SignUp serverErrors={{ email: "That email is already registered." }} />,
  play: async ({ canvas }) => {
    await userEvent.type(canvas.getByRole("textbox", { name: "Name" }), "Ada");
    await userEvent.type(canvas.getByRole("textbox", { name: "Email" }), "ada@example.com");
    await userEvent.click(canvas.getByRole("button", { name: "Create account" }));

    await expect(await canvas.findByText("That email is already registered.")).toBeVisible();
    await waitFor(() =>
      expect(canvas.getByRole("textbox", { name: "Email" })).toHaveAttribute(
        "aria-invalid",
        "true",
      ),
    );
  },
});
