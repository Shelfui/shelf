"use client";

import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import * as Command from "@/components/ui/command";
import { CalendarIcon, PlusIcon, SearchIcon } from "@/components/ui/icons";
import { Kbd } from "@/components/ui/kbd";
import { spacing } from "@/styles/shelf/tokens.stylex";

type Action = { value: string; label: string; icon?: "calendar" | "plus"; shortcut?: string };
type ActionGroup = { value: string; items: Action[] };

const GROUPS: ActionGroup[] = [
  {
    value: "Suggestions",
    items: [
      { value: "new-invoice", label: "New invoice", icon: "plus", shortcut: "⌘N" },
      { value: "schedule-payment", label: "Schedule payment", icon: "calendar" },
      { value: "new-customer", label: "New customer", icon: "plus" },
    ],
  },
  {
    value: "Settings",
    items: [
      { value: "profile", label: "Profile", shortcut: "⌘P" },
      { value: "billing", label: "Billing", shortcut: "⌘B" },
      { value: "team", label: "Team members" },
    ],
  },
];

function Palette({ onRun }: { onRun: (action: Action) => void }) {
  return (
    <Command.Root items={GROUPS}>
      <Command.Input aria-label="Search commands" placeholder="Type a command or search…" />
      <Command.List aria-label="Commands">
        {(group: ActionGroup) => (
          <Command.Group key={group.value} items={group.items}>
            <Command.GroupLabel>{group.value}</Command.GroupLabel>
            <Command.Collection>
              {(item: Action) => (
                <Command.Item key={item.value} value={item} onClick={() => onRun(item)}>
                  {item.icon === "plus" && <PlusIcon />}
                  {item.icon === "calendar" && <CalendarIcon />}
                  {item.label}
                  {item.shortcut && <Command.Shortcut>{item.shortcut}</Command.Shortcut>}
                </Command.Item>
              )}
            </Command.Collection>
          </Command.Group>
        )}
      </Command.List>
      <Command.Empty>No results found.</Command.Empty>
    </Command.Root>
  );
}

export default function CommandDemo() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div {...stylex.props(styles.root)}>
      <Palette onRun={() => {}} />
      <Button variant="outline" onClick={() => setOpen(true)} style={styles.trigger}>
        <SearchIcon />
        Search commands
        <Kbd>⌘K</Kbd>
      </Button>
      <Command.Dialog open={open} onOpenChange={setOpen}>
        <Palette onRun={() => setOpen(false)} />
      </Command.Dialog>
    </div>
  );
}

const styles = stylex.create({
  root: {
    gap: spacing["4"],
    display: "grid",
    justifyItems: "center",
    maxWidth: "28rem",
    width: "100%",
  },
  trigger: { gap: spacing["2"] },
});
