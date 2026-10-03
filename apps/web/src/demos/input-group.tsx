import * as stylex from "@stylexjs/stylex";
import { SearchIcon } from "@/components/ui/icons";
import * as InputGroup from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import { spacing } from "@/styles/shelf/tokens.stylex";

export default function InputGroupDemo() {
  return (
    <div {...stylex.props(styles.stack)}>
      <InputGroup.Root>
        <InputGroup.Addon>
          <SearchIcon />
        </InputGroup.Addon>
        <InputGroup.Input aria-label="Search" placeholder="Search invoices" />
        <InputGroup.Addon>
          <Kbd>⌘K</Kbd>
        </InputGroup.Addon>
      </InputGroup.Root>
      <InputGroup.Root>
        <InputGroup.Addon>https://</InputGroup.Addon>
        <InputGroup.Input aria-label="Website" placeholder="example.com" />
      </InputGroup.Root>
    </div>
  );
}

const styles = stylex.create({
  stack: { gap: spacing["3"], display: "grid", maxWidth: "20rem", width: "100%" },
});
