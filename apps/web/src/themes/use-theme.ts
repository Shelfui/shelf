"use client";

import { useTheme } from "next-themes";
import { useCallback, useEffect, useSyncExternalStore } from "react";
import {
  THEME_STORAGE_KEY,
  applyThemeVars,
  readSelection,
  storeSelection,
  selectionVars,
} from "./apply";
import { DEFAULT_SELECTION, type Mode, type ThemeSelection } from "./presets";

const CHANGE_EVENT = "shelf-theme-change";

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY) onChange();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

let snapshot: { raw: string | null; selection: ThemeSelection } = {
  raw: null,
  selection: DEFAULT_SELECTION,
};

function getSelection(): ThemeSelection {
  const raw = localStorage.getItem(THEME_STORAGE_KEY);
  if (raw !== snapshot.raw) snapshot = { raw, selection: readSelection() };
  return snapshot.selection;
}

const noop = () => () => {};

/** False during server rendering and hydration, true afterwards. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

/** The resolved mode, or null until hydration has read it. */
export function useMode(): Mode | null {
  const { resolvedTheme } = useTheme();
  if (!useHydrated()) return null;
  return resolvedTheme === "dark" ? "dark" : "light";
}

export function useThemeSelection(): [ThemeSelection, (next: ThemeSelection) => void] {
  const selection = useSyncExternalStore(subscribe, getSelection, () => DEFAULT_SELECTION);
  const setSelection = useCallback((next: ThemeSelection) => {
    storeSelection(next);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);
  return [selection, setSelection];
}

/** Keeps `<body>`'s theme variables in step with the selection and the mode. */
export function ThemeSync() {
  const [selection] = useThemeSelection();
  const mode = useMode();

  useEffect(() => {
    if (mode) applyThemeVars(selectionVars(selection, mode), mode);
  }, [selection, mode]);

  return null;
}
