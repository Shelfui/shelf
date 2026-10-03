"use client";

import * as stylex from "@stylexjs/stylex";
import * as Autocomplete from "@/components/ui/autocomplete";

const TAGS = ["Design", "Engineering", "Finance", "Marketing", "Operations", "Sales", "Support"];

export default function AutocompleteDemo() {
  return (
    <div {...stylex.props(styles.root)}>
      <Autocomplete.Root items={TAGS}>
        <Autocomplete.Input aria-label="Team" placeholder="Add a team" />
        <Autocomplete.Content>
          <Autocomplete.Empty>No matching teams.</Autocomplete.Empty>
          <Autocomplete.List>
            {(tag: string) => (
              <Autocomplete.Item key={tag} value={tag}>
                {tag}
              </Autocomplete.Item>
            )}
          </Autocomplete.List>
        </Autocomplete.Content>
      </Autocomplete.Root>
    </div>
  );
}

const styles = stylex.create({
  root: { maxWidth: "16rem", width: "100%" },
});
