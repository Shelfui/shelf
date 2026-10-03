import { CommanderError } from "@commander-js/extra-typings";
import { ShelfError, errorMessage } from "../core/errors";
import type { Io } from "./program";

/**
 * Commander reports usage errors as `error: unknown option '--x'\n(Did you mean --y?)`.
 * Shelf prints every failure the same way: one `✗` line, then how to proceed.
 */
export function formatCommanderError(text: string, helpCommand: string): string {
  const message = text
    .trim()
    .replace(/^error: /, "")
    .split("\n")
    .map((line) => line.trim().replace(/^\((.*)\)$/, "$1"))
    .filter(Boolean)
    .map((line, index, lines) =>
      index < lines.length - 1 && !/[.?!]$/.test(line) ? `${line}.` : line,
    )
    .join(" ");
  return `✗ ${message.charAt(0).toUpperCase()}${message.slice(1)}\n  Run: ${helpCommand}\n`;
}

/** Maps anything thrown while running a command to output and an exit code. */
export function handleError(error: unknown, io: Io): number {
  // Commander has already written help, the version, or a formatted usage error.
  if (error instanceof CommanderError) return error.exitCode;
  if (error instanceof ShelfError) {
    io.stderr(`✗ ${error.message}\n`);
    return 1;
  }
  io.stderr("✗ Internal error in Shelf. Please report it with the output below.\n");
  io.stderr(`${(error instanceof Error && error.stack) || errorMessage(error)}\n`);
  return 1;
}
