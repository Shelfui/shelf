import { expect, fn, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import { SignupForm } from "./signup-form";

const meta = preview.meta({
  title: "Blocks/Signup Form",
  component: SignupForm,
  parameters: { figma: { fill: true } },
});

const submitted = fn();

/** Valid details and accepted terms submit as `{ name, email, password }`. */
export const Default = meta.story({
  render: () => <SignupForm onSubmit={submitted} />,
  play: async ({ canvas }) => {
    submitted.mockClear();

    await userEvent.type(canvas.getByRole("textbox", { name: "Name" }), "Ada Lovelace");
    await userEvent.type(canvas.getByRole("textbox", { name: "Email" }), "ada@example.com");
    await userEvent.type(canvas.getByLabelText("Password"), "analytical");
    await userEvent.click(canvas.getByRole("checkbox"));
    await userEvent.click(canvas.getByRole("button", { name: "Create account" }));

    await waitFor(() =>
      expect(submitted).toHaveBeenCalledWith({
        name: "Ada Lovelace",
        email: "ada@example.com",
        password: "analytical",
      }),
    );
  },
});

/** A short password and unaccepted terms block the submit with their errors. */
export const Invalid = meta.story({
  render: () => <SignupForm onSubmit={submitted} />,
  play: async ({ canvas }) => {
    submitted.mockClear();

    await userEvent.type(canvas.getByRole("textbox", { name: "Name" }), "Ada");
    await userEvent.type(canvas.getByRole("textbox", { name: "Email" }), "ada@example.com");
    await userEvent.type(canvas.getByLabelText("Password"), "short");
    await userEvent.click(canvas.getByRole("button", { name: "Create account" }));

    await expect(await canvas.findByText("Use at least 8 characters.")).toBeVisible();
    await expect(canvas.getByText("Accept the terms to continue.")).toBeVisible();
    await expect(submitted).not.toHaveBeenCalled();
  },
});
