import { docs } from "../../core/docs";
import { type Context, type ShelfProgram, resolveCwd } from "../program";

export function registerDocs(program: ShelfProgram, context: Context): void {
  program
    .command("docs")
    .description("Print documentation for a topic or an item, as Markdown")
    .argument("[topic]", "a topic or an item name (default: list them)")
    .option("--registry <location>", "registry path or URL (default: shelf.config.json)")
    .action(async (topic, _options, command) => {
      const { cwd, registry } = command.optsWithGlobals();
      await docs({ cwd: resolveCwd(cwd), topic, registry, out: context.out });
    });
}
