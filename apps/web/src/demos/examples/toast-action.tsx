"use client";

import { Button } from "@/components/ui/button";
import { toastManager } from "@/components/ui/toast";

export default function ToastAction() {
  return (
    <Button
      variant="outline"
      onClick={() =>
        toastManager.add({
          title: "Invoice archived",
          actionProps: { children: "Undo" },
        })
      }
    >
      Archive invoice
    </Button>
  );
}
