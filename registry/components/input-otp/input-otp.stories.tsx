import { expect, fn, userEvent } from "storybook/test";
import preview from "@/.storybook/preview";
import { Label } from "../label/label";
import * as InputOTP from "./input-otp";

const meta = preview.meta({
  title: "Components/Input OTP",
  component: InputOTP.Root,
  args: { id: "otp", length: 6, onValueComplete: fn() },
  decorators: [
    (Story) => (
      <div style={{ display: "grid", gap: 8 }}>
        <Label htmlFor="otp">Verification code</Label>
        {Story()}
      </div>
    ),
  ],
  render: (args) => (
    <InputOTP.Root {...args}>
      {Array.from({ length: 6 }, (_, index) => (
        <InputOTP.Slot
          key={index}
          aria-label={index === 0 ? undefined : `Character ${index + 1} of 6`}
        />
      ))}
    </InputOTP.Root>
  ),
  parameters: { figma: {} },
});

/** Typing fills the slots in order and reports the full code once complete. */
export const Default = meta.story({
  play: async ({ args, canvas }) => {
    const first = canvas.getByRole("textbox", { name: "Verification code" });

    await userEvent.click(first);
    await userEvent.keyboard("123456");

    await expect(args.onValueComplete).toHaveBeenCalledWith("123456", expect.anything());
    await expect(canvas.getByRole("textbox", { name: "Character 6 of 6" })).toHaveValue("6");
  },
});

/** Pasting a code fills every slot at once. */
export const Paste = meta.story({
  play: async ({ args, canvas }) => {
    await userEvent.click(canvas.getByRole("textbox", { name: "Verification code" }));
    await userEvent.paste("654321");

    await expect(args.onValueComplete).toHaveBeenCalledWith("654321", expect.anything());
  },
});

export const WithSeparator = meta.story({
  render: (args) => (
    <InputOTP.Root {...args}>
      {Array.from({ length: 6 }, (_, index) => [
        index === 3 ? <InputOTP.Separator key="separator" /> : null,
        <InputOTP.Slot
          key={index}
          aria-label={index === 0 ? undefined : `Character ${index + 1} of 6`}
        />,
      ])}
    </InputOTP.Root>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("separator")).toBeInTheDocument();
  },
});
