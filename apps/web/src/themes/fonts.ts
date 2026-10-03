import {
  DM_Sans,
  Geist,
  Geist_Mono,
  Instrument_Sans,
  Inter,
  JetBrains_Mono,
} from "next/font/google";

// The default pair preloads: every page renders with it.
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

// Not preloaded: a preset's font downloads only once a preset uses it.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", preload: false });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", preload: false });
const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  preload: false,
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  preload: false,
});

/** Defines each preset font's `--font-*` variable. */
export const fontVariables = [geist, geistMono, inter, dmSans, instrumentSans, jetbrainsMono]
  .map((font) => font.variable)
  .join(" ");
