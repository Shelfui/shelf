import path from "node:path";
import { Command } from "@commander-js/extra-typings";
import pkg from "../../package.json" with { type: "json" };
import type { Output } from "../core/output";
import { registerAdd } from "./commands/add";
import { registerBuild } from "./commands/build";
import { registerCheck } from "./commands/check";
import { registerDiff } from "./commands/diff";
import { registerDocs } from "./commands/docs";
import { registerInit } from "./commands/init";
import { registerSearch } from "./commands/search";
import { registerServe } from "./commands/serve";
import { registerStatus } from "./commands/status";
import { registerUpdate } from "./commands/update";
import { registerUsage } from "./commands/usage";
import { formatCommanderError, handleError } from "./errors";

export interface Io {
  stdout(text: string): void;
  stderr(text: string): void;
}

/** What command actions receive: where to write, and how to report a non-error failure. */
export interface Context {
  out: Output;
  exitCode: number;
}

const processIo: Io = {
  stdout: (text) => process.stdout.write(text),
  stderr: (text) => process.stderr.write(text),
};

function rootCommand(io: Io) {
  return (
    new Command()
      .name("shelf")
      .description("Shelf: take what you need, own the source.")
      .version(pkg.version, "-v, --version", "print the Shelf CLI version")
      .helpOption("-h, --help", "show help")
      .helpCommand(false)
      .option("--cwd <dir>", "run as if started in <dir>")
      .showSuggestionAfterError()
      .exitOverride()
      // A fixed width keeps help output identical in terminals, pipes, and agents.
      .configureHelp({ helpWidth: 100, showGlobalOptions: true })
      .configureOutput({
        writeOut: (text) => io.stdout(text),
        writeErr: (text) => io.stderr(text),
      })
  );
}

export type ShelfProgram = ReturnType<typeof rootCommand>;

export function resolveCwd(cwd: string | undefined): string {
  return path.resolve(cwd ?? process.cwd());
}

function createProgram(io: Io, context: Context): ShelfProgram {
  const program = rootCommand(io);
  registerInit(program, context);
  registerSearch(program, context);
  registerAdd(program, context);
  registerStatus(program, context);
  registerDiff(program, context);
  registerUpdate(program, context);
  registerCheck(program, context);
  registerDocs(program, context);
  registerUsage(program, context, io);
  registerBuild(program, context);
  registerServe(program, context);
  program.addHelpText(
    "after",
    `
Examples:
  shelf init --registry ./registry
  shelf add button
  shelf status
  shelf docs button
  shelf update
  shelf check --only provenance,imports
  shelf usage apps --registry ./registry
  shelf build registry --out dist/registry`,
  );

  for (const command of [program, ...program.commands]) {
    const helpCommand = command === program ? "shelf --help" : `shelf ${command.name()} --help`;
    command.configureOutput({
      outputError: (text, write) => write(formatCommanderError(text, helpCommand)),
    });
  }
  return program;
}

/** Runs the CLI and resolves to the process exit code. Never throws. */
export async function run(args: string[], io: Io = processIo): Promise<number> {
  const context: Context = { out: { log: (line = "") => io.stdout(`${line}\n`) }, exitCode: 0 };
  try {
    const program = createProgram(io, context);
    await program.parseAsync(args.length > 0 ? args : ["--help"], { from: "user" });
    return context.exitCode;
  } catch (error) {
    return handleError(error, io);
  }
}
