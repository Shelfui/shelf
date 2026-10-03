import { diff } from "../../core/diff";
import { type Context, type ShelfProgram, resolveCwd } from "../program";

export function registerDiff(program: ShelfProgram, context: Context): void {
  program
    .command("diff")
    .description("Show Shelf's changes to an item since you installed it")
    .argument("<item>", "an installed item name")
    .option("--local", "show your changes instead")
    .option("--json", "print the diff as JSON")
    .action(async (name, _options, command) => {
      const { cwd, local, json } = command.optsWithGlobals();
      await diff({
        cwd: resolveCwd(cwd),
        name,
        local: local === true,
        json: json === true,
        out: context.out,
      });
    });
}
