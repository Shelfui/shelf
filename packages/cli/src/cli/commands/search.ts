import { search } from "../../core/search";
import { type Context, type ShelfProgram, resolveCwd } from "../program";

export function registerSearch(program: ShelfProgram, context: Context): void {
  program
    .command("search")
    .description("List registry items matching every term")
    .argument("[query...]", "search terms")
    .option("--registry <location>", "registry path or URL (default: shelf.config.json)")
    .action(async (query, _options, command) => {
      const { cwd, registry } = command.optsWithGlobals();
      await search({ cwd: resolveCwd(cwd), query: query.join(" "), registry, out: context.out });
    });
}
