import { expect, fn, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import { LoginForm } from "./login-form";

const meta = preview.meta({
  title: "Blocks/Login Form",
  component: LoginForm,
  parameters: { figma: { fill: true } },
});

const submitted = fn();

/** Valid credentials submit as `{ email, password }`. */
export const Default = meta.story({
  render: () => <LoginForm onSubmit={submitted} />,
  play: async ({ canvas }) => {
    submitted.mockClear();

    await userEvent.type(canvas.getByRole("textbox", { name: "Email" }), "ada@example.com");
    await userEvent.type(canvas.getByLabelText("Password"), "correct horse");
    await userEvent.click(canvas.getByRole("button", { name: "Log in" }));

    await waitFor(() =>
      expect(submitted).toHaveBeenCalledWith({
        email: "ada@example.com",
        password: "correct horse",
      }),
    );
  },
});

/** Submitting empty or malformed fields shows their errors and focuses the first one. */
export const Invalid = meta.story({
  render: () => <LoginForm onSubmit={submitted} />,
  play: async ({ canvas }) => {
    submitted.mockClear();

    await userEvent.click(canvas.getByRole("button", { name: "Log in" }));

    await expect(await canvas.findByText("Enter your email.")).toBeVisible();
    await expect(canvas.getByText("Enter your password.")).toBeVisible();
    await expect(canvas.getByRole("textbox", { name: "Email" })).toHaveFocus();

    await userEvent.type(canvas.getByRole("textbox", { name: "Email" }), "ada");
    await userEvent.click(canvas.getByRole("button", { name: "Log in" }));

    await expect(await canvas.findByText("Enter a valid email address.")).toBeVisible();
    await expect(submitted).not.toHaveBeenCalled();
  },
});

/** While `onSubmit`'s promise is pending, the submit button shows a spinner and is disabled. */
export const Submitting = meta.story({
  render: () => <LoginForm onSubmit={() => new Promise(() => {})} />,
  play: async ({ canvas }) => {
    await userEvent.type(canvas.getByRole("textbox", { name: "Email" }), "ada@example.com");
    await userEvent.type(canvas.getByLabelText("Password"), "correct horse");
    await userEvent.click(canvas.getByRole("button", { name: "Log in" }));

    await waitFor(() => expect(canvas.getByRole("button", { name: "Log in" })).toBeDisabled());
  },
});
