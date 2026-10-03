import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { Button } from "./components/ui/button";
import * as Dialog from "./components/ui/dialog";
import { applyTheme } from "./styles/shelf/themes";
import { colors, spacing, typography } from "./styles/shelf/tokens.stylex";

export function App() {
  const [dark, setDark] = useState(false);
  const [count, setCount] = useState(0);
  const [deleted, setDeleted] = useState(false);

  const toggleTheme = () => {
    applyTheme(dark ? "light" : "dark");
    setDark(!dark);
  };

  return (
    <main {...stylex.props(styles.page)}>
      <h1 {...stylex.props(styles.title)}>Shelf</h1>

      <p {...stylex.props(styles.body)}>
        Button and Dialog arrived through <code>shelf add</code>. Their source in{" "}
        <code>src/components/ui</code> belongs to this app, which added a local <code>xl</code>{" "}
        button size and narrowed its dialogs.
      </p>

      <div {...stylex.props(styles.row)}>
        <Button onClick={() => setCount((value) => value + 1)}>Clicked {count} times</Button>
        <Button variant="outline" onClick={toggleTheme}>
          {dark ? "Light" : "Dark"} theme
        </Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Cancel</Button>
        <Button variant="link">Learn more</Button>
      </div>

      <div {...stylex.props(styles.row)}>
        <Button size="xl">Get started</Button>

        <Dialog.Root>
          <Dialog.Trigger render={<Button variant="destructive" disabled={deleted} />}>
            {deleted ? "Project deleted" : "Delete project"}
          </Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Delete project?</Dialog.Title>
              <Dialog.Description>
                This removes the project and its invoices. You can't undo this.
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Footer>
              <Dialog.Close render={<Button variant="outline" />}>Cancel</Dialog.Close>
              <Dialog.Close
                render={<Button variant="destructive" onClick={() => setDeleted(true)} />}
              >
                Delete
              </Dialog.Close>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Root>
      </div>
    </main>
  );
}

const styles = stylex.create({
  page: {
    backgroundColor: colors.background,
    boxSizing: "border-box",
    color: colors.foreground,
    display: "flex",
    flexDirection: "column",
    fontFamily: typography.fontFamily,
    gap: spacing["4"],
    minHeight: "100%",
    padding: spacing["6"],
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: typography.fontWeightSemibold,
    marginBlock: 0,
  },
  body: {
    color: colors.mutedForeground,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
    marginBlock: 0,
  },
  row: {
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    gap: spacing["3"],
  },
});
