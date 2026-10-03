import * as stylex from "@stylexjs/stylex";
import * as Alert from "@/components/ui/alert";
import { InfoIcon } from "@/components/ui/icons";

export default function AlertDemo() {
  return (
    <Alert.Root role="status" style={styles.alert}>
      <InfoIcon />
      <Alert.Title>Invoices are sent at 9:00</Alert.Title>
      <Alert.Description>Change the send time in your workspace settings.</Alert.Description>
    </Alert.Root>
  );
}

const styles = stylex.create({
  alert: { maxWidth: "28rem" },
});
