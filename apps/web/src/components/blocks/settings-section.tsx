"use client";

import * as stylex from "@stylexjs/stylex";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import * as Card from "@/components/ui/card";
import * as Field from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { colors, spacing, typography } from "@/styles/shelf/tokens.stylex";

export interface ProfileValues {
  name: string;
  email: string;
  bio: string;
  notifications: boolean;
}

export interface SettingsSectionProps {
  defaultValues: ProfileValues;
  /** Called with the values when the user saves valid changes. */
  onSave: (values: ProfileValues) => void;
}

/**
 * A settings section: a heading and description beside a profile form. Save stays
 * disabled until something changes, and Cancel restores the saved values.
 */
export function SettingsSection({ defaultValues, onSave }: SettingsSectionProps) {
  const headingId = useId();
  const [saved, setSaved] = useState(defaultValues);
  const [revision, setRevision] = useState(0);
  const [dirty, setDirty] = useState(false);

  function reset() {
    setDirty(false);
    setRevision((current) => current + 1);
  }

  return (
    <section aria-labelledby={headingId} {...stylex.props(styles.section)}>
      <div {...stylex.props(styles.intro)}>
        <h2 id={headingId} {...stylex.props(styles.heading)}>
          Profile
        </h2>
        <p {...stylex.props(styles.text)}>How you appear to other people in this workspace.</p>
      </div>
      <Card.Root style={styles.card}>
        <Form
          key={revision}
          style={styles.form}
          onChange={() => setDirty(true)}
          onFormSubmit={(values) => {
            const next = {
              name: String(values["name"]),
              email: String(values["email"]),
              bio: String(values["bio"] ?? ""),
              notifications: Boolean(values["notifications"]),
            };
            setSaved(next);
            onSave(next);
            reset();
          }}
        >
          <Card.Content style={styles.fields}>
            <Field.Root name="name">
              <Field.Label>Name</Field.Label>
              <Input defaultValue={saved.name} autoComplete="name" required />
              <Field.Error match="valueMissing">Enter your name.</Field.Error>
            </Field.Root>
            <Field.Root name="email">
              <Field.Label>Email</Field.Label>
              <Input type="email" defaultValue={saved.email} autoComplete="email" required />
              <Field.Error match="valueMissing">Enter your email.</Field.Error>
              <Field.Error match="typeMismatch">Enter a valid email address.</Field.Error>
            </Field.Root>
            <Field.Root name="bio">
              <Field.Label>Bio</Field.Label>
              <Textarea defaultValue={saved.bio} rows={3} />
              <Field.Description>A sentence or two about what you work on.</Field.Description>
            </Field.Root>
            <Field.Root name="notifications" style={styles.switchRow}>
              <div {...stylex.props(styles.switchText)}>
                <Field.Label>Email notifications</Field.Label>
                <Field.Description>Mentions and replies, sent once a day.</Field.Description>
              </div>
              <Switch defaultChecked={saved.notifications} onCheckedChange={() => setDirty(true)} />
            </Field.Root>
          </Card.Content>
          <Card.Footer style={styles.footer}>
            <Button type="button" variant="outline" disabled={!dirty} onClick={reset}>
              Cancel
            </Button>
            <Button type="submit" disabled={!dirty}>
              Save
            </Button>
          </Card.Footer>
        </Form>
      </Card.Root>
    </section>
  );
}

const styles = stylex.create({
  section: {
    gap: spacing["6"],
    display: "flex",
    flexWrap: "wrap",
    fontFamily: typography.fontFamily,
    width: "100%",
  },
  intro: {
    gap: spacing["1"],
    display: "flex",
    flexBasis: "14rem",
    flexDirection: "column",
    flexGrow: 1,
  },
  heading: {
    margin: 0,
    color: colors.foreground,
    fontSize: typography.fontSizeBase,
    fontWeight: typography.fontWeightSemibold,
    lineHeight: typography.lineHeightBase,
  },
  text: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
  },
  card: {
    flexBasis: "20rem",
    flexGrow: 2,
    minWidth: 0,
  },
  form: {
    gap: spacing["6"],
  },
  fields: {
    gap: spacing["4"],
    display: "flex",
    flexDirection: "column",
  },
  switchRow: {
    gap: spacing["4"],
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  switchText: {
    gap: spacing["1"],
    display: "flex",
    flexDirection: "column",
  },
  footer: {
    justifyContent: "flex-end",
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: 1,
    paddingTop: spacing["6"],
  },
});
