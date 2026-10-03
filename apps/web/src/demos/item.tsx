import * as stylex from "@stylexjs/stylex";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronRightIcon, CircleCheckIcon } from "@/components/ui/icons";
import * as Item from "@/components/ui/item";
import { spacing } from "@/styles/shelf/tokens.stylex";

export default function ItemDemo() {
  return (
    <div {...stylex.props(styles.root)}>
      <Item.Root variant="outline">
        <Item.Media variant="icon">
          <CalendarIcon />
        </Item.Media>
        <Item.Content>
          <Item.Title>Quarterly review</Item.Title>
          <Item.Description>Thursday, 14:00 to 15:00, with the finance team.</Item.Description>
        </Item.Content>
        <Item.Actions>
          <Button size="sm" variant="outline">
            Decline
          </Button>
          <Button size="sm">Accept</Button>
        </Item.Actions>
      </Item.Root>

      <Item.Root variant="muted" size="sm">
        <Item.Media>
          <CircleCheckIcon />
        </Item.Media>
        <Item.Content>
          <Item.Title>Your bank account is connected</Item.Title>
        </Item.Content>
      </Item.Root>

      <Item.Group>
        <Item.Root size="sm" render={<a href="#profile" />}>
          <Item.Content>
            <Item.Title>Profile</Item.Title>
            <Item.Description>Name, email, and avatar.</Item.Description>
          </Item.Content>
          <Item.Actions>
            <ChevronRightIcon />
          </Item.Actions>
        </Item.Root>
        <Item.Separator />
        <Item.Root size="sm" render={<a href="#billing" />}>
          <Item.Content>
            <Item.Title>Billing</Item.Title>
            <Item.Description>Plans, invoices, and payment methods.</Item.Description>
          </Item.Content>
          <Item.Actions>
            <ChevronRightIcon />
          </Item.Actions>
        </Item.Root>
      </Item.Group>
    </div>
  );
}

const styles = stylex.create({
  root: { gap: spacing["4"], display: "grid", maxWidth: "28rem", width: "100%" },
});
