import * as stylex from "@stylexjs/stylex";
import * as InputOTP from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { spacing } from "@/styles/shelf/tokens.stylex";

export default function InputOTPDemo() {
  return (
    <div {...stylex.props(styles.stack)}>
      <Label htmlFor="otp-code">Verification code</Label>
      <InputOTP.Root id="otp-code" length={6}>
        {Array.from({ length: 6 }, (_, index) => (
          <InputOTP.Slot
            key={index}
            aria-label={index ? `Character ${index + 1} of 6` : undefined}
          />
        ))}
      </InputOTP.Root>
    </div>
  );
}

const styles = stylex.create({
  stack: { gap: spacing["2"], display: "grid" },
});
