import { RetryIcon } from "@/components/ui/icons";
import * as Message from "@/components/ui/message";
import * as stylex from "@stylexjs/stylex";
import { spacing } from "@/styles/shelf/tokens.stylex";

export default function MessageDemo() {
  return (
    <div {...stylex.props(styles.column)}>
      <Message.Root from="user">
        <Message.Content>What changed in the last release?</Message.Content>
      </Message.Root>
      <Message.Root from="assistant">
        <Message.Content>Streaming got faster, and code blocks load on demand.</Message.Content>
        <Message.Actions>
          <Message.CopyAction text="Streaming got faster, and code blocks load on demand." />
          <Message.Action label="Retry" icon={<RetryIcon />} />
        </Message.Actions>
      </Message.Root>
    </div>
  );
}

const styles = stylex.create({
  column: { gap: spacing["4"], display: "flex", flexDirection: "column", maxWidth: "32rem" },
});
