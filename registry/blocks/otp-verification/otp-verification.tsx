"use client";

import * as stylex from "@stylexjs/stylex";
import { useId, useState } from "react";
import { Button } from "../../components/button/button";
import * as Card from "../../components/card/card";
import * as InputOTP from "../../components/input-otp/input-otp";
import { Label } from "../../components/label/label";
import { colors, spacing, typography } from "../../foundations/tokens.stylex";

const LENGTH = 6;

export interface OtpVerificationProps {
  /** Where the code was sent, shown in the description. */
  email: string;
  onVerify: (code: string) => void;
  onResend?: () => void;
}

/** A card that asks for the six-digit code sent to the user. Verify enables once it's complete. */
export function OtpVerification({ email, onVerify, onResend }: OtpVerificationProps) {
  const id = useId();
  const [code, setCode] = useState("");
  const complete = code.length === LENGTH;

  return (
    <Card.Root style={styles.card}>
      <Card.Header style={styles.center}>
        <Card.Title>Check your email</Card.Title>
        <Card.Description>
          We sent a {LENGTH}-digit code to <span {...stylex.props(styles.email)}>{email}</span>.
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (complete) onVerify(code);
          }}
          {...stylex.props(styles.form)}
        >
          <div {...stylex.props(styles.field)}>
            <Label htmlFor={id}>Verification code</Label>
            <InputOTP.Root
              id={id}
              length={LENGTH}
              value={code}
              onValueChange={setCode}
              style={styles.otp}
            >
              {Array.from({ length: LENGTH }, (_, index) => (
                <InputOTP.Slot
                  key={index}
                  aria-label={index === 0 ? undefined : `Character ${index + 1} of ${LENGTH}`}
                />
              ))}
            </InputOTP.Root>
          </div>
          <Button type="submit" disabled={!complete}>
            Verify
          </Button>
        </form>
      </Card.Content>
      <Card.Footer style={styles.footer}>
        <span {...stylex.props(styles.footerText)}>Didn’t get it?</span>
        <Button variant="link" size="sm" onClick={onResend}>
          Resend code
        </Button>
      </Card.Footer>
    </Card.Root>
  );
}

const styles = stylex.create({
  card: {
    maxWidth: "24rem",
    width: "100%",
  },
  center: {
    textAlign: "center",
  },
  email: {
    color: colors.foreground,
    fontWeight: typography.fontWeightMedium,
  },
  form: {
    gap: spacing["4"],
    display: "flex",
    flexDirection: "column",
  },
  field: {
    gap: spacing["2"],
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
  },
  otp: {
    justifyContent: "center",
  },
  footer: {
    gap: spacing["1"],
    justifyContent: "center",
  },
  footerText: {
    color: colors.mutedForeground,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
  },
});
