import { InvalidArgumentError } from "@commander-js/extra-typings";
import { STEPS, type StepName, check, parseSteps } from "../../core/check";
import { errorMessage } from "../../core/errors";
import { type Context, type ShelfProgram, resolveCwd } from "../program";

function stepsArgument(value: string): StepName[] | undefined {
  try {
    return parseSteps(value);
  } catch (error) {
    throw new InvalidArgumentError(errorMessage(error));
  }
}

export function registerCheck(program: ShelfProgram, context: Context): void {
  program
    .command("check")
    .description("Validate installed Shelf items (exit 1 on failure)")
    .option("--only <steps>", "run only these comma-separated steps", stepsArgument)
    .option("--verbose", "list every detail instead of the first 30")
    .addHelpText("after", `\nSteps: ${STEPS.join(", ")}`)
    .action(async (_options, command) => {
      const { cwd, only, verbose } = command.optsWithGlobals();
      const ok = await check({
        cwd: resolveCwd(cwd),
        only,
        verbose: verbose === true,
        out: context.out,
      });
      if (!ok) context.exitCode = 1;
    });
}
