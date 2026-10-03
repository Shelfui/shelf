"use client";

import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import * as Field from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { colors, typography } from "@/styles/shelf/tokens.stylex";

export default function FormDemo() {
  const [name, setName] = useState<string | null>(null);

  return (
    <Form
      style={styles.form}
      onFormSubmit={(values) => setName(typeof values["name"] === "string" ? values["name"] : "")}
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
        <Field.Error match="typeMismatch">Enter a valid email address.</Field.Error>
      </Field.Root>
      <Button type="submit">Create account</Button>
      {name !== null && <p {...stylex.props(styles.done)}>Welcome, {name}.</p>}
    </Form>
  );
}

const styles = stylex.create({
  form: { maxWidth: "20rem", width: "100%" },
  done: { color: colors.mutedForeground, fontSize: typography.fontSizeSm, margin: 0 },
});
