import * as stylex from "@stylexjs/stylex";
import * as Message from "@/components/ui/message";
import * as Thread from "@/components/ui/thread";

const LINES = Array.from({ length: 12 }, (_, i) => i);

export default function ThreadDemo() {
  return (
    <div {...stylex.props(styles.frame)}>
      <Thread.Root>
        <Thread.Viewport>
          <Thread.Content>
            {LINES.map((i) => (
              <Message.Root key={i} from={i % 2 ? "assistant" : "user"}>
                <Message.Content>Message {i + 1}</Message.Content>
              </Message.Root>
            ))}
          </Thread.Content>
        </Thread.Viewport>
        <Thread.ScrollToLatest />
      </Thread.Root>
    </div>
  );
}

const styles = stylex.create({
  frame: { display: "flex", height: "18rem", width: "100%" },
});
