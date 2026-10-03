import { expect, fn, userEvent } from "storybook/test";
import preview from "@/.storybook/preview";
import { OtpVerification } from "./otp-verification";

const meta = preview.meta({
  title: "Blocks/OTP Verification",
  component: OtpVerification,
  parameters: { figma: { fill: true } },
});

const verified = fn();
const resent = fn();

/** Verify stays disabled until all six digits are in, then reports the code. */
export const Default = meta.story({
  render: () => <OtpVerification email="ada@example.com" onVerify={verified} onResend={resent} />,
  play: async ({ canvas }) => {
    verified.mockClear();
    const verify = canvas.getByRole("button", { name: "Verify" });

    await userEvent.click(canvas.getByRole("textbox", { name: "Verification code" }));
    await userEvent.keyboard("123");
    await expect(verify).toBeDisabled();

    await userEvent.keyboard("456");
    await expect(verify).toBeEnabled();

    await userEvent.click(verify);
    await expect(verified).toHaveBeenCalledWith("123456");
  },
});

/** Resend is a real button that reports the request. */
export const Resend = meta.story({
  render: () => <OtpVerification email="ada@example.com" onVerify={verified} onResend={resent} />,
  play: async ({ canvas }) => {
    resent.mockClear();

    await userEvent.click(canvas.getByRole("button", { name: "Resend code" }));

    await expect(resent).toHaveBeenCalledTimes(1);
  },
});
