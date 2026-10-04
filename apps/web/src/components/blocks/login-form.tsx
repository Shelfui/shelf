"use client";

import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import * as Card from "@/components/ui/card";
import * as Field from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { media } from "@/styles/shelf/conditions.stylex";
import { colors, radius, spacing, typography } from "@/styles/shelf/tokens.stylex";

export interface LoginValues {
  email: string;
  password: string;
}

export interface LoginFormProps {
  /** Called with the values once every field is valid. Return a promise to show the pending state. */
  onSubmit: (values: LoginValues) => void | Promise<void>;
}

/** A card that signs a user in with email and password, or with SSO. */
export function LoginForm({ onSubmit }: LoginFormProps) {
  const [pending, setPending] = useState(false);

  // Not try/finally: React Compiler cannot compile a try without a catch yet.
  async function submit(values: LoginValues) {
    setPending(true);
    await Promise.resolve(onSubmit(values)).finally(() => setPending(false));
  }

  return (
    <Card.Root style={styles.card}>
      <Card.Header>
        <Card.Title>Log in to your account</Card.Title>
        <Card.Description>Enter your email and password to continue.</Card.Description>
      </Card.Header>
      <Card.Content>
        <Form
          onFormSubmit={(values) => {
            void submit({ email: String(values["email"]), password: String(values["password"]) });
          }}
        >
          <Field.Root name="email">
            <Field.Label>Email</Field.Label>
            <Input type="email" autoComplete="email" placeholder="you@example.com" required />
            <Field.Error match="valueMissing">Enter your email.</Field.Error>
            <Field.Error match="typeMismatch">Enter a valid email address.</Field.Error>
          </Field.Root>
          <Field.Root name="password">
            <div {...stylex.props(styles.labelRow)}>
              <Field.Label>Password</Field.Label>
              <a href="/forgot-password" {...stylex.props(styles.link)}>
                Forgot password?
              </a>
            </div>
            <Input type="password" autoComplete="current-password" required />
            <Field.Error match="valueMissing">Enter your password.</Field.Error>
          </Field.Root>
          <Button type="submit" disabled={pending}>
            {pending && <Spinner aria-hidden />}
            Log in
          </Button>
          <div {...stylex.props(styles.divider)}>
            <Separator style={styles.dividerLine} />
            <span>or</span>
            <Separator style={styles.dividerLine} />
          </div>
          <Button type="button" variant="outline">
            Continue with SSO
          </Button>
        </Form>
      </Card.Content>
      <Card.Footer style={styles.footer}>
        <p {...stylex.props(styles.footerText)}>
          Don’t have an account?{" "}
          <a href="/sign-up" {...stylex.props(styles.link)}>
            Sign up
          </a>
        </p>
      </Card.Footer>
    </Card.Root>
  );
}

const styles = stylex.create({
  card: {
    maxWidth: "24rem",
    width: "100%",
  },
  labelRow: {
    gap: spacing["2"],
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
  },
  link: {
    borderRadius: radius.sm,
    color: {
      default: colors.mutedForeground,
      ":hover": {
        default: null,
        [media.hover]: colors.foreground,
      },
    },
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    textDecorationLine: "underline",
    textUnderlineOffset: "0.2em",
  },
  divider: {
    gap: spacing["3"],
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    fontSize: typography.fontSizeXs,
    lineHeight: typography.lineHeightXs,
  },
  dividerLine: {
    flexGrow: 1,
    width: "auto",
  },
  footer: {
    justifyContent: "center",
  },
  footerText: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
  },
});
