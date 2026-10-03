"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  DEFAULT_PACKAGE_MANAGER,
  type PackageManager,
  isPackageManager,
} from "@/lib/package-manager";

const KEY = "shelf-package-manager";
/** Tells every command on the page, since `storage` only fires in other documents. */
const CHANGE = "shelf-package-manager-change";

/** The choice for this page, for when storage is unavailable, such as in some private windows. */
let current: PackageManager | undefined;

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE, onChange);
  };
}

function read(): PackageManager {
  try {
    const stored = localStorage.getItem(KEY);
    if (isPackageManager(stored)) return stored;
  } catch {
    // Fall back to this page's choice.
  }
  return current ?? DEFAULT_PACKAGE_MANAGER;
}

/** The reader's package manager, remembered across pages and visits. */
export function usePackageManager(): [PackageManager, (pm: PackageManager) => void] {
  const pm = useSyncExternalStore(subscribe, read, () => DEFAULT_PACKAGE_MANAGER);
  const setPm = useCallback((next: PackageManager) => {
    current = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // Kept in `current` for this page.
    }
    window.dispatchEvent(new Event(CHANGE));
  }, []);
  return [pm, setPm];
}
