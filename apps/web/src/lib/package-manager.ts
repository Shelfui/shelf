export const PACKAGE_MANAGERS = ["npm", "pnpm", "yarn", "bun"] as const;
export type PackageManager = (typeof PACKAGE_MANAGERS)[number];

/** Shelf's reference stack. */
export const DEFAULT_PACKAGE_MANAGER: PackageManager = "bun";

export function isPackageManager(value: unknown): value is PackageManager {
  return PACKAGE_MANAGERS.some((pm) => pm === value);
}

/** `shelf <args>` through the project's locally installed `@shelfui/cli`. */
export function runCommand(pm: PackageManager, args: string): string {
  const runner = { npm: "npx", pnpm: "pnpm", yarn: "yarn", bun: "bunx" }[pm];
  return `${runner} shelf ${args}`;
}

export function addCommand(pm: PackageManager, packages: string[], { dev = false } = {}): string {
  const install = pm === "npm" ? "npm install" : `${pm} add`;
  const flag = dev ? (pm === "bun" ? " -d" : " -D") : "";
  return `${install}${flag} ${packages.join(" ")}`;
}
