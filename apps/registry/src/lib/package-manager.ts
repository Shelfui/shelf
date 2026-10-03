export const PACKAGE_MANAGERS = ["npm", "pnpm", "yarn", "bun"] as const;
export type PackageManager = (typeof PACKAGE_MANAGERS)[number];

/** Shelf's reference stack. */
export const DEFAULT_PACKAGE_MANAGER: PackageManager = "bun";

export function isPackageManager(value: unknown): value is PackageManager {
  return PACKAGE_MANAGERS.some((pm) => pm === value);
}

/** How to run `shelf` through the project's locally installed `@shelfui/cli`. */
export function runner(pm: PackageManager): string {
  return { npm: "npx", pnpm: "pnpm", yarn: "yarn", bun: "bunx" }[pm] + " shelf";
}
