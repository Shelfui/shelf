"use client";

import { PaletteIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import * as Popover from "@/components/ui/popover";
import { useThemeSelection } from "@/themes/use-theme";

// Both load on first use: neither is needed to paint or hydrate the header.
const CustomizerPanel = dynamic(() => import("./customizer-panel").then((m) => m.CustomizerPanel));
const ThemeCodeDialog = dynamic(() => import("./theme-code-dialog").then((m) => m.ThemeCodeDialog));

export function Customizer() {
  const [selection] = useThemeSelection();
  const [open, setOpen] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  // Stay mounted after the first open so the popover and dialog can animate out.
  const [panelUsed, setPanelUsed] = useState(false);
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
