"use client";

import { Button } from "@/components/ui/button";
import { toastManager } from "@/components/ui/toast";

export default function ToastDemo() {
  return (
    <Button
      variant="outline"
      onClick={() =>
        toastManager.add({
          title: "Invoice sent",
          description: "Acme Inc. will get it by email.",
        })
      }
    >
      Send invoice
    </Button>
  );
}
