"use client";

import { Form as BaseForm } from "@base-ui/react/form";
import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { spacing } from "../../styles/shelf/tokens.stylex";
import type { Styled } from "../../lib/shelf/utils";

export type FormProps = Styled<ComponentProps<typeof BaseForm>>;

/**
 * A native form that validates its `Field`s together, focuses the first invalid one on
 * submit, and shows server errors passed through `errors` (keyed by field `name`).
 * Use `onFormSubmit` to receive the values as an object.
 */
export function Form({ style, ...props }: FormProps) {
  return <BaseForm data-slot="form" {...props} {...stylex.props(styles.form, style)} />;
}

const styles = stylex.create({
  form: {
    gap: spacing["4"],
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
});
