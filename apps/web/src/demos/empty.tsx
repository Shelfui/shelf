import * as stylex from "@stylexjs/stylex";
import { Button } from "@/components/ui/button";
import * as Empty from "@/components/ui/empty";
import { PlusIcon, SearchIcon } from "@/components/ui/icons";
import { colors, spacing } from "@/styles/shelf/tokens.stylex";

export default function EmptyDemo() {
  return (
    <Empty.Root style={styles.root}>
      <Empty.Header>
        <Empty.Media variant="icon">
          <SearchIcon />
        </Empty.Media>
        <Empty.Title>No projects yet</Empty.Title>
        <Empty.Description>
          Projects group your invoices, expenses, and time. Create one to get started, or import
          them from a spreadsheet.
        </Empty.Description>
      </Empty.Header>
      <Empty.Content>
        <div {...stylex.props(styles.actions)}>
          <Button>
            <PlusIcon />
            Create project
          </Button>
          <Button variant="outline">Import</Button>
        </div>
      </Empty.Content>
    </Empty.Root>
  );
}

const styles = stylex.create({
  root: {
    borderColor: colors.border,
    borderStyle: "dashed",
    borderWidth: 1,
    maxWidth: "32rem",
  },
  actions: { gap: spacing["2"], display: "flex" },
});
