"use client";

import { PaletteIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import * as Popover from "@/components/ui/popover";
import { useThemeSelection } from "@/themes/use-theme";
import { CustomizerPanel } from "./customizer-panel";

// The panel ships in this module, which is already loaded on first use. The code dialog is
// rarer, so it loads when "Copy code" is pressed.
const ThemeCodeDialog = dynamic(() => import("./theme-code-dialog").then((m) => m.ThemeCodeDialog));

/** The popover with its trigger. Loaded on first use; `defaultOpen` opens it as it mounts. */
export function CustomizerPopover({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [selection] = useThemeSelection();
  const [open, setOpen] = useState(defaultOpen);
  const [codeOpen, setCodeOpen] = useState(false);
  // Stay mounted after the first open so the popover and dialog can animate out.
  const [panelUsed, setPanelUsed] = useState(defaultOpen);
  const [dialogUsed, setDialogUsed] = useState(false);

  return (
    <>
      <Popover.Root
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) setPanelUsed(true);
        }}
      >
        <Popover.Trigger render={<Button variant="ghost" size="icon-sm" aria-label="Customize" />}>
          <PaletteIcon />
        </Popover.Trigger>
        {panelUsed && (
          <CustomizerPanel
            onCopyCode={() => {
              setOpen(false);
              setCodeOpen(true);
              setDialogUsed(true);
            }}
          />
        )}
      </Popover.Root>
      {dialogUsed && (
        <ThemeCodeDialog selection={selection} open={codeOpen} onOpenChange={setCodeOpen} />
      )}
    </>
  );
}
