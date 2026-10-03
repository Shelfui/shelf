import { spawn } from "node:child_process";

export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

/** Runs a command to completion and collects its output. A missing executable exits 127. */
export function exec(
  argv: string[],
  { cwd, env }: { cwd: string; env?: NodeJS.ProcessEnv },
): Promise<ExecResult> {
  const [command = "", ...args] = argv;
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd, env: env ?? process.env });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8").on("data", (chunk: string) => (stdout += chunk));
    child.stderr.setEncoding("utf8").on("data", (chunk: string) => (stderr += chunk));
    child.on("error", (error) =>
      resolve({ stdout, stderr: `${stderr}${error.message}`, exitCode: 127 }),
    );
    child.on("close", (code) => resolve({ stdout, stderr, exitCode: code ?? 1 }));
  });
}
