export const PACKAGE_MANAGERS = ["npm", "pnpm", "yarn", "bun"] as const;
export type PackageManager = (typeof PACKAGE_MANAGERS)[number];

/** Shelf's reference stack. */
export const DEFAULT_PACKAGE_MANAGER: PackageManager = "bun";

export function isPackageManager(value: unknown): value is PackageManager {
  return PACKAGE_MANAGERS.some((pm) => pm === value);
}

/** How to run the Shelf CLI without installing it first. */
export function runner(pm: PackageManager): string {
  return { npm: "npx", pnpm: "pnpm dlx", yarn: "yarn dlx", bun: "bunx" }[pm] + " @shelfui/cli";
}
