import * as stylex from "@stylexjs/stylex";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckboxGroup } from "@/components/ui/checkbox-group";
import { Label } from "@/components/ui/label";
import { spacing } from "@/styles/shelf/tokens.stylex";

const PERMISSIONS = ["view", "edit", "invite"];

export default function CheckboxGroupDemo() {
  return (
    <CheckboxGroup
      aria-label="Permissions"
      defaultValue={["view"]}
      allValues={PERMISSIONS}
      style={styles.group}
    >
      <Label>
        <Checkbox parent /> All permissions
      </Label>
      <div {...stylex.props(styles.children)}>
        <Label>
          <Checkbox value="view" /> View projects
        </Label>
        <Label>
          <Checkbox value="edit" /> Edit projects
        </Label>
        <Label>
          <Checkbox value="invite" /> Invite members
        </Label>
      </div>
    </CheckboxGroup>
  );
}

const styles = stylex.create({
  group: { gap: spacing["3"], display: "grid" },
  children: { gap: spacing["3"], display: "grid", paddingInlineStart: spacing["6"] },
});
