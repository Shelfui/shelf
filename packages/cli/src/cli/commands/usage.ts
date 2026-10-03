import { ShelfError } from "../../core/errors";
import { gitHubFromEnv } from "../../core/github";
import { collectUsage, reportUsage, usageJson } from "../../core/usage";
import { type Context, type Io, type ShelfProgram, resolveCwd } from "../program";

const collect = (value: string, previous: string[]) => [...previous, value];

export function registerUsage(program: ShelfProgram, context: Context, io: Io): void {
  program
    .command("usage")
    .description("Show where installed Shelf items are used, across projects and repos")
    .argument("[dirs...]", "directories to search for shelf.config.json (default: current)")
    .option("--repo <url>", "also clone and scan a git repository (repeatable)", collect, [])
    .option(
      "--github <org>",
      "also scan every repo in a GitHub organization that has a shelf.config.json, using GH_TOKEN (repeatable)",
      collect,
      [],
    )
    .option("--registry <path-or-url>", "compare every project with this registry")
    .option("--json", "print the usage graph as JSON")
    .addHelpText(
      "after",
      `
Examples:
  shelf usage
  shelf usage apps packages --registry ./registry
  shelf usage --repo git@github.com:acme/web.git --registry ./registry --json > usage.json
  GH_TOKEN=… shelf usage --github acme --registry ./registry --json > usage.json`,
    )
    .action(async (dirs, options, command) => {
      const { cwd } = command.optsWithGlobals();
      const orgs: string[] = options.github;
      const github = orgs.length > 0 ? gitHubFromEnv() : undefined;
      if (orgs.length > 0 && !github) {
        throw new ShelfError(
          `--github needs a token. Set GH_TOKEN or GITHUB_TOKEN to one that can read the repositories in ${orgs.join(", ")}.`,
        );
      }
      const graph = await collectUsage({
        cwd: resolveCwd(cwd),
        dirs: dirs.length > 0 ? dirs : ["."],
        repos: options.repo,
        ...(github && { github: { ...github, orgs } }),
        ...(options.registry !== undefined && { registry: options.registry }),
      });
      if (options.json) io.stdout(usageJson(graph));
      else reportUsage(graph, context.out);
    });
}
