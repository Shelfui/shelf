import { status } from "../../core/status";
import { type Context, type ShelfProgram, resolveCwd } from "../program";

export function registerStatus(program: ShelfProgram, context: Context): void {
  program
    .command("status")
    .description("Show which installed items you changed and which Shelf has updated")
    .argument("[items...]", "installed item names (default: all)")
    .option("--json", "print the project and its items as JSON")
    .action(async (names, _options, command) => {
      const { cwd, json } = command.optsWithGlobals();
      await status({ cwd: resolveCwd(cwd), names, json: json === true, out: context.out });
    });
}
