"use client";

import * as stylex from "@stylexjs/stylex";
import { useId } from "react";
import { SettingsSection } from "../../blocks/settings-section/settings-section";
import type { ProfileValues } from "../../blocks/settings-section/settings-section";
import { Button } from "../../components/button/button";
import * as Card from "../../components/card/card";
import { Separator } from "../../components/separator/separator";
import { colors, spacing, typography } from "../../foundations/tokens.stylex";
import { ConfirmDialog } from "../../patterns/confirm-dialog/confirm-dialog";

export type { ProfileValues };

export interface SettingsPageProps {
  profile: ProfileValues;
  /** Called with the values when the person saves valid changes. */
  onSaveProfile: (values: ProfileValues) => void;
  /** Runs after the person confirms. A thrown error is shown in the dialog. */
  onDeleteAccount: () => void | Promise<void>;
}

/**
 * A page of settings sections, each a heading and description beside its controls. It starts
 * with Profile and a danger zone. Add a section by placing another one between the
 * separators, and keep the danger zone last.
 */
export function SettingsPage({ profile, onSaveProfile, onDeleteAccount }: SettingsPageProps) {
  const dangerId = useId();

  return (
    <main {...stylex.props(styles.page)}>
      <header {...stylex.props(styles.header)}>
        <h1 {...stylex.props(styles.title)}>Settings</h1>
        <p {...stylex.props(styles.text)}>Manage your profile and your account.</p>
      </header>

      <SettingsSection defaultValues={profile} onSave={onSaveProfile} />

      <Separator />

      <section aria-labelledby={dangerId} {...stylex.props(styles.section)}>
        <div {...stylex.props(styles.intro)}>
          <h2 id={dangerId} {...stylex.props(styles.heading)}>
            Delete account
          </h2>
          <p {...stylex.props(styles.text)}>Remove your account and everything in it.</p>
        </div>
        <Card.Root style={styles.card}>
          <Card.Content>
            <p {...stylex.props(styles.text)}>
              Your projects, files, and history are deleted. You can't undo this.
            </p>
          </Card.Content>
          <Card.Footer style={styles.footer}>
            <ConfirmDialog
              title="Delete your account?"
              description="Your projects, files, and history are deleted for good."
              confirmLabel="Delete account"
              destructive
              onConfirm={onDeleteAccount}
            >
              <Button variant="destructive">Delete account</Button>
            </ConfirmDialog>
          </Card.Footer>
        </Card.Root>
      </section>
    </main>
  );
}

const styles = stylex.create({
  page: {
    padding: spacing["6"],
    gap: spacing["6"],
    marginInline: "auto",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    fontFamily: typography.fontFamily,
    maxWidth: "56rem",
    width: "100%",
  },
  header: {
    gap: spacing["1"],
    display: "flex",
    flexDirection: "column",
  },
  title: {
    margin: 0,
    color: colors.foreground,
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightSemibold,
    lineHeight: typography.lineHeightLg,
  },
  section: {
    gap: spacing["6"],
    display: "flex",
    flexWrap: "wrap",
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
  footer: {
    justifyContent: "flex-end",
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: 1,
    paddingTop: spacing["6"],
  },
});
