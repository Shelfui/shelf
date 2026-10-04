"use client";

import { PaletteIcon } from "lucide-react";
import { type ComponentType, useState } from "react";
import { Button } from "@/components/ui/button";

type Popover = ComponentType<{ defaultOpen?: boolean }>;

let loading: Promise<Popover> | undefined;

// The popover, its positioning code, and the theme panel load on first use: the header ships
// only a button until someone reaches for it. This is a plain import rather than next/dynamic,
// because a Suspense fallback makes React hold the content back for up to 300ms after it loads.
const load = () => (loading ??= import("./customizer-popover").then((m) => m.CustomizerPopover));

export function Customizer() {
  const [Popover, setPopover] = useState<Popover | null>(null);

  if (Popover) return <Popover defaultOpen />;
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Customize"
      onClick={() => void load().then((loaded) => setPopover(() => loaded))}
      // Start loading before the click, so the panel opens without a wait.
      onPointerEnter={() => void load()}
      onFocus={() => void load()}
    >
      <PaletteIcon />
    </Button>
  );
}
