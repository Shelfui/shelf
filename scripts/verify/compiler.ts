import { transformAsync } from "@babel/core";
import reactCompiler from "babel-plugin-react-compiler";
import { type Item, isSource } from "./items";

/**
 * How many components and hooks React Compiler compiled, and how many it had to skip. A skip
 * means the code breaks a Rule of React the compiler relies on. Null when an item has neither.
 */
export async function compileWithReactCompiler(
  item: Item,
): Promise<{ compiled: number; failed: number } | null> {
  const result = { compiled: 0, failed: 0 };
  for (const file of item.files.filter(isSource)) {
    await transformAsync(await Bun.file(file).text(), {
      filename: file,
      babelrc: false,
      configFile: false,
      presets: ["@babel/preset-typescript"],
      plugins: [
        "@babel/plugin-syntax-jsx",
        [
          reactCompiler,
          {
            panicThreshold: "none",
            logger: {
              logEvent(_filename: string | null, event: { kind: string }) {
                if (event.kind === "CompileSuccess") result.compiled++;
                else if (event.kind === "CompileError" || event.kind === "PipelineError") {
                  result.failed++;
                }
              },
            },
          },
        ],
      ],
    });
  }
  return result.compiled + result.failed === 0 ? null : result;
}
