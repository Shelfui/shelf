import * as stylex from "@stylexjs/stylex";
import * as Accordion from "@/components/ui/accordion";

export default function AccordionDemo() {
  return (
    <Accordion.Root defaultValue={["ownership"]} style={styles.root}>
      <Accordion.Item value="ownership">
        <Accordion.Trigger>Who owns the code?</Accordion.Trigger>
        <Accordion.Panel>
          You do. Shelf copies plain React and StyleX source into your app, so you can read and
          change every line.
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="updates">
        <Accordion.Trigger>How do updates work?</Accordion.Trigger>
        <Accordion.Panel>
          Every install records what was copied. Shelf compares that base with your copy and the
          registry, so you can see what changed on each side.
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="accessibility">
        <Accordion.Trigger>Is it accessible?</Accordion.Trigger>
        <Accordion.Panel>
          Yes. Interaction comes from Base UI, and every component ships with accessibility tests.
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  );
}

const styles = stylex.create({
  root: { maxWidth: "28rem", width: "100%" },
});
