"use client";

import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import * as Card from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import * as Field from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { media } from "@/styles/shelf/conditions.stylex";
import { colors, radius, spacing, typography } from "@/styles/shelf/tokens.stylex";

export interface SignupValues {
  name: string;
  email: string;
  password: string;
}

export interface SignupFormProps {
  /** Called with the values once every field is valid. Return a promise to show the pending state. */
  onSubmit: (values: SignupValues) => void | Promise<void>;
}

/** A card that creates an account with a name, email, and password, after accepting the terms. */
export function SignupForm({ onSubmit }: SignupFormProps) {
  const [pending, setPending] = useState(false);

  async function submit(values: SignupValues) {
    setPending(true);
    try {
      await onSubmit(values);
    } finally {
      setPending(false);
    }
  }

  return (
    <Card.Root style={styles.card}>
      <Card.Header>
        <Card.Title>Create an account</Card.Title>
        <Card.Description>Start with a free workspace. No card required.</Card.Description>
      </Card.Header>
      <Card.Content>
        <Form
          onFormSubmit={(values) => {
            void submit({
              name: String(values["name"]),
              email: String(values["email"]),
              password: String(values["password"]),
            });
          }}
        >
          <Field.Root name="name">
            <Field.Label>Name</Field.Label>
            <Input autoComplete="name" required />
            <Field.Error match="valueMissing">Enter your name.</Field.Error>
          </Field.Root>
          <Field.Root name="email">
            <Field.Label>Email</Field.Label>
            <Input type="email" autoComplete="email" placeholder="you@example.com" required />
            <Field.Error match="valueMissing">Enter your email.</Field.Error>
            <Field.Error match="typeMismatch">Enter a valid email address.</Field.Error>
          </Field.Root>
          <Field.Root
            name="password"
            validate={(value) => {
              const password = typeof value === "string" ? value : "";
              return password && password.length < 8 ? "Use at least 8 characters." : null;
            }}
          >
            <Field.Label>Password</Field.Label>
            <Input type="password" autoComplete="new-password" required />
            <Field.Description>At least 8 characters.</Field.Description>
            <Field.Error match="valueMissing">Choose a password.</Field.Error>
            <Field.Error match="customError" />
          </Field.Root>
          <Field.Root name="terms">
            <Field.Label style={styles.terms}>
              <Checkbox required />
              <span>
                I agree to the{" "}
                <a href="/terms" {...stylex.props(styles.link)}>
                  terms
                </a>{" "}
                and{" "}
                <a href="/privacy" {...stylex.props(styles.link)}>
                  privacy policy
                </a>
                .
              </span>
            </Field.Label>
            <Field.Error match="valueMissing">Accept the terms to continue.</Field.Error>
          </Field.Root>
          <Button type="submit" disabled={pending}>
            {pending && <Spinner aria-hidden />}
            Create account
          </Button>
        </Form>
      </Card.Content>
      <Card.Footer style={styles.footer}>
        <p {...stylex.props(styles.footerText)}>
          Already have an account?{" "}
          <a href="/login" {...stylex.props(styles.link)}>
            Log in
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
  terms: {
    gap: spacing["2"],
    alignItems: "flex-start",
    display: "flex",
    fontWeight: typography.fontWeightRegular,
  },
  link: {
    borderRadius: radius.sm,
    color: {
      default: "inherit",
      ":hover": {
        default: null,
        [media.hover]: colors.foreground,
      },
    },
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    textDecorationLine: "underline",
    textUnderlineOffset: "0.2em",
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
