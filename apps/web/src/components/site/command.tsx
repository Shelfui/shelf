import { highlight } from "@/lib/highlight";
import { PACKAGE_MANAGERS, addCommand, runCommand } from "@/lib/package-manager";
import { CommandTabs } from "./command-tabs";

/** A terminal command in the reader's package manager: `shelf <args>`, or adding `packages`. */
export async function Command(props: { args: string } | { packages: string[]; dev?: boolean }) {
  const commands = await Promise.all(
    PACKAGE_MANAGERS.map(async (pm) => {
      const code =
        "args" in props
          ? runCommand(pm, props.args)
          : addCommand(pm, props.packages, { dev: props.dev });
      return { pm, code, html: await highlight(code, "bash") };
    }),
  );
  return <CommandTabs commands={commands} />;
}
