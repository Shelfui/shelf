import { existsSync } from "node:fs";
import path from "node:path";
import { InvalidArgumentError } from "@commander-js/extra-typings";
import { ShelfError } from "../../core/errors";
import { serveRegistry } from "../../serve";
import { type Context, type ShelfProgram, resolveCwd } from "../program";

function portArgument(value: string): number {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 0 || port > 65_535) {
    throw new InvalidArgumentError("Port must be a whole number from 0 to 65535.");
  }
  return port;
}

export function registerServe(program: ShelfProgram, context: Context): void {
  program
    .command("serve")
    .description("Serve a registry directory over HTTP on 127.0.0.1 (until stopped)")
    .argument("[dir]", "registry directory, source or built", "registry")
    .option("--port <port>", "port to listen on, 0 for any free port", portArgument, 4400)
    .action(async (dir, { port }, command) => {
      const { cwd } = command.optsWithGlobals();
      const root = path.resolve(resolveCwd(cwd), dir);
      if (!existsSync(path.join(root, "index.json"))) {
        throw new ShelfError(
          `No index.json in ${root}. Pass the registry directory: shelf serve <dir>`,
        );
      }
      const server = await serveRegistry(root, port);
      context.out.log(`Serving ${root} at ${server.url}`);
      context.out.log(`Use it with: shelf init --registry ${server.url}`);
    });
}
