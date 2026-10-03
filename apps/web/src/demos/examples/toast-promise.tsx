"use client";

import { Button } from "@/components/ui/button";
import { toastManager } from "@/components/ui/toast";

const save = () => new Promise<void>((resolve) => setTimeout(resolve, 1200));

export default function ToastPromise() {
  return (
    <Button
      variant="outline"
      onClick={() => {
        void toastManager.promise(save(), {
          loading: "Saving changes…",
          success: "Changes saved",
          error: { title: "Couldn't save", description: "Check your connection and try again." },
        });
      }}
    >
      Save changes
    </Button>
  );
}
