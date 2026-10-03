"use client";

import * as stylex from "@stylexjs/stylex";
import { Button } from "@/components/ui/button";
import { toastManager } from "@/components/ui/toast";
import { spacing } from "@/styles/shelf/tokens.stylex";

export default function ToastTypes() {
  return (
    <div {...stylex.props(styles.row)}>
      <Button
        variant="outline"
        onClick={() =>
          toastManager.add({
            title: "Payment received",
            description: "$1,240.00 from Acme Inc.",
            type: "success",
          })
        }
      >
        Success
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toastManager.add({
            title: "Payment failed",
            description: "The card was declined.",
            type: "error",
          })
        }
      >
        Error
      </Button>
    </div>
  );
}

const styles = stylex.create({
  row: { gap: spacing["2"], display: "flex", flexWrap: "wrap", justifyContent: "center" },
});
