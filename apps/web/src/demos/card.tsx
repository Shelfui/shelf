import * as stylex from "@stylexjs/stylex";
import { Button } from "@/components/ui/button";
import * as Card from "@/components/ui/card";
import * as Field from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { spacing } from "@/styles/shelf/tokens.stylex";

export default function CardDemo() {
  return (
    <Card.Root style={styles.card}>
      <Card.Header>
        <Card.Title>Invite your team</Card.Title>
        <Card.Description>Teammates can view and edit every project.</Card.Description>
      </Card.Header>
      <Card.Content style={styles.content}>
        <Field.Root>
          <Field.Label>Email</Field.Label>
          <Input type="email" placeholder="ada@example.com" />
        </Field.Root>
      </Card.Content>
      <Card.Footer style={styles.footer}>
        <Button variant="outline">Cancel</Button>
        <Button>Send invite</Button>
      </Card.Footer>
    </Card.Root>
  );
}

const styles = stylex.create({
  card: { maxWidth: "24rem", width: "100%" },
  content: { gap: spacing["4"], display: "grid" },
  footer: { gap: spacing["2"], justifyContent: "flex-end" },
});
