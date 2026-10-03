import * as stylex from "@stylexjs/stylex";
import * as Accordion from "@/components/ui/accordion";

export default function AccordionMultiple() {
  return (
    <Accordion.Root multiple defaultValue={["shipping", "returns"]} style={styles.root}>
      <Accordion.Item value="shipping">
        <Accordion.Trigger>Shipping</Accordion.Trigger>
        <Accordion.Panel>Orders ship within two business days.</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="returns">
        <Accordion.Trigger>Returns</Accordion.Trigger>
        <Accordion.Panel>Return anything within 30 days for a full refund.</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="warranty">
        <Accordion.Trigger>Warranty</Accordion.Trigger>
        <Accordion.Panel>Every product is covered for two years.</Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  );
}

const styles = stylex.create({
  root: { maxWidth: "28rem", width: "100%" },
});
