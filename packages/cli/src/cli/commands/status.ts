import { status } from "../../core/status";
import { type Context, type ShelfProgram, resolveCwd } from "../program";

export function registerStatus(program: ShelfProgram, context: Context): void {
  program
    .command("status")
    .description("Show which installed items you changed and which Shelf has updated")
    .argument("[items...]", "installed item names (default: all)")
    .action(async (names, _options, command) => {
      const { cwd } = command.optsWithGlobals();
      await status({ cwd: resolveCwd(cwd), names, out: context.out });
    });
}
