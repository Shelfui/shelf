"use client";

import * as stylex from "@stylexjs/stylex";
import * as Combobox from "@/components/ui/combobox";

const COUNTRIES = ["Canada", "Denmark", "France", "Germany", "Japan", "Norway", "Sweden"];

export default function ComboboxDemo() {
  return (
    <div {...stylex.props(styles.root)}>
      <Combobox.Root items={COUNTRIES}>
        <Combobox.Input aria-label="Country" placeholder="Search countries" />
        <Combobox.Content>
          <Combobox.Empty>No countries found.</Combobox.Empty>
          <Combobox.List>
            {(country: string) => (
              <Combobox.Item key={country} value={country}>
                {country}
              </Combobox.Item>
            )}
          </Combobox.List>
        </Combobox.Content>
      </Combobox.Root>
    </div>
  );
}

const styles = stylex.create({
  root: { maxWidth: "16rem", width: "100%" },
});
