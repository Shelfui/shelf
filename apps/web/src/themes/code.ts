import { type PackageManager, addCommand } from "@/lib/package-manager";
import {
  COLOR_NAMES,
  type Palette,
  type ThemeSelection,
  radiusScale,
  resolveTheme,
} from "./presets";

export interface ThemeFile {
  file: string;
  /** What to do with the code in that file. */
  action: string;
  code: string;
}

function entries(palette: Palette): string {
  return COLOR_NAMES.map((name) => `  ${name}: "${palette[name]}",`).join("\n");
}

/** Code that turns an installed Shelf theme into the selected one. */
export function generateThemeCode(selection: ThemeSelection, pm: PackageManager): ThemeFile[] {
  const light = resolveTheme(selection, "light");
  const { palette: dark } = resolveTheme(selection, "dark");
  const { preset } = light;
  const scale = radiusScale(light.radius);

  const files: ThemeFile[] = [
    {
      file: "tokens.stylex.ts",
      action: "Replace colors and radius, and the two font families in typography.",
      code: `export const colors = stylex.defineVars({
${entries(light.palette)}
});

export const radius = stylex.defineVars({
  none: "0",
  sm: "${scale.sm}",
  md: "${scale.md}",
  lg: "${scale.lg}",
  full: "9999px",
});

// In typography:
  fontFamily: '${preset.sans.code}',
  fontFamilyMono: '${preset.mono.code}',`,
    },
    {
      file: "themes.ts",
      action: "Replace darkTheme.",
      code: `export const darkTheme = stylex.createTheme(colors, {
${entries(dark)}
});`,
    },
  ];

  const packages = [...new Set([preset.sans.package, preset.mono.package])];
  files.push({
    file: "fonts.css",
    action: `Replace the imports, then run: ${addCommand(pm, packages)}`,
    code: [...new Set([...preset.sans.imports, ...preset.mono.imports])]
      .map((name) => `@import "${name}";`)
      .join("\n"),
  });
  return files;
}
