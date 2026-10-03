import { init } from "../../core/init";
import { type Context, type ShelfProgram, resolveCwd } from "../program";

export function registerInit(program: ShelfProgram, context: Context): void {
  program
    .command("init")
    .description("Create shelf.config.json and .shelf/")
    .option("--registry <location>", "registry path or URL (default: $SHELF_REGISTRY)")
    .option(
      "--header <header>",
      "request header for an http(s) registry, repeatable; quote ${VAR} to keep it out of the file",
      (value: string, previous: string[] | undefined) => [...(previous ?? []), value],
    )
    .option("--no-agents", "don't write the AGENTS.md block or the Shelf skill")
    .action(async (_options, command) => {
      const { cwd, registry, header = [], agents } = command.optsWithGlobals();
      await init({
        cwd: resolveCwd(cwd),
        registry,
        header,
        agents,
        out: context.out,
      });
    });
}
