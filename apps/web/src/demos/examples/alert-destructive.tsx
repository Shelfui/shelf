import * as stylex from "@stylexjs/stylex";
import * as Alert from "@/components/ui/alert";
import { CircleAlertIcon } from "@/components/ui/icons";

export default function AlertDestructive() {
  return (
    <Alert.Root variant="destructive" style={styles.alert}>
      <CircleAlertIcon />
      <Alert.Title>Payment failed</Alert.Title>
      <Alert.Description>Update your card to keep your plan.</Alert.Description>
    </Alert.Root>
  );
}

const styles = stylex.create({
  alert: { maxWidth: "28rem" },
});
