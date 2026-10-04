"use client";

import { PaletteIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const load = () => import("./customizer-popover").then((m) => m.CustomizerPopover);

// The popover, its positioning code, and the theme panel load on first use: the header ships
// only a button until someone reaches for it.
const CustomizerPopover = dynamic(load, { loading: () => <CustomizeButton /> });

function CustomizeButton(props: React.ComponentProps<typeof Button>) {
  return (
    <Button variant="ghost" size="icon-sm" aria-label="Customize" {...props}>
      <PaletteIcon />
    </Button>
  );
}

export function Customizer() {
  const [wanted, setWanted] = useState(false);

  if (wanted) return <CustomizerPopover defaultOpen />;
  return (
    <CustomizeButton
      onClick={() => setWanted(true)}
      // Start loading before the click, so the panel opens without a wait.
      onPointerEnter={() => void load()}
      onFocus={() => void load()}
    />
  );
}
