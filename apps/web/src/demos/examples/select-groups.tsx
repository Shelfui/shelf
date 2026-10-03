import * as stylex from "@stylexjs/stylex";
import * as Field from "@/components/ui/field";
import * as Select from "@/components/ui/select";

const ZONES = [
  {
    region: "Europe",
    items: [
      { value: "Europe/London", label: "London" },
      { value: "Europe/Stockholm", label: "Stockholm" },
    ],
  },
  {
    region: "Americas",
    items: [
      { value: "America/New_York", label: "New York" },
      { value: "America/Los_Angeles", label: "Los Angeles" },
    ],
  },
];

export default function SelectGroups() {
  return (
    <Field.Root style={styles.root}>
      <Field.Label>Time zone</Field.Label>
      <Select.Root items={ZONES.flatMap((zone) => zone.items)}>
        <Select.Trigger>
          <Select.Value placeholder="Choose a time zone" />
        </Select.Trigger>
        <Select.Content>
          {ZONES.map((zone, index) => (
            <Select.Group key={zone.region}>
              {index > 0 && <Select.Separator />}
              <Select.Label>{zone.region}</Select.Label>
              {zone.items.map((item) => (
                <Select.Item key={item.value} value={item.value}>
                  {item.label}
                </Select.Item>
              ))}
            </Select.Group>
          ))}
        </Select.Content>
      </Select.Root>
    </Field.Root>
  );
}

const styles = stylex.create({
  root: { width: "14rem" },
});
