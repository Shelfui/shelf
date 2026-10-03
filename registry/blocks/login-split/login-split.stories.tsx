import { expect, fn, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import { LoginSplit } from "./login-split";

const meta = preview.meta({
  title: "Blocks/Login Split",
  component: LoginSplit,
  parameters: { figma: { fill: true }, layout: "fullscreen" },
});

const submitted = fn();

/** The page holds one main landmark with the login form, which submits as usual. */
export const Default = meta.story({
  render: () => <LoginSplit onSubmit={submitted} />,
  play: async ({ canvas }) => {
    submitted.mockClear();
    const main = canvas.getByRole("main");

    await expect(main).toContainElement(canvas.getByRole("button", { name: "Log in" }));

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
