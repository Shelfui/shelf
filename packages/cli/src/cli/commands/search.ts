import { search } from "../../core/search";
import { type Context, type ShelfProgram, resolveCwd } from "../program";

export function registerSearch(program: ShelfProgram, context: Context): void {
  program
    .command("search")
    .description("List registry items matching every term")
    .argument("[query...]", "search terms")
    .option("--registry <location>", "registry path or URL (default: shelf.config.json)")
    .option("--json", "print the matches as JSON")
    .action(async (query, _options, command) => {
      const { cwd, registry, json } = command.optsWithGlobals();
      await search({
        cwd: resolveCwd(cwd),
        query: query.join(" "),
        registry,
        json: json === true,
        out: context.out,
      });
    });
}
