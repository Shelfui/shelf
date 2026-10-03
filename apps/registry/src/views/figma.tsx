import * as stylex from "@stylexjs/stylex";
import { Link } from "@tanstack/react-router";
import { type ReactNode, useEffect, useState } from "react";
import { CopyButton } from "@/components/site/command";
import { PageHeader } from "@/components/site/page-header";
import { layout, text } from "@/components/site/styles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CircleAlertIcon, CircleCheckIcon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import * as T from "@/components/ui/typography";
import { type Registry, useAsync, useRegistry } from "@/data";
import {
  type ApplyResult,
  type FileInfo,
  type Library,
  type ToUi,
  captureLibrary,
  changes,
  fileKey,
  figmaFileUrl,
  figmaNodes,
  forRegistry,
  hasFigmaLibrary,
  inPluginWindow,
  linksCurrent,
  toPlugin,
} from "@/figma";
import { NotFound } from "@/views/not-found";
import { colors, radius, spacing, typography } from "@/styles/shelf/tokens.stylex";

export function Figma() {
  const registry = useRegistry();
  if (!hasFigmaLibrary(registry)) {
    return (
      <NotFound title="No Figma library">
        This registry was built without a Storybook, or its Storybook has no Figma/Library story.
        Build it with: shelf build registry --storybook storybook-static
      </NotFound>
    );
  }
  return inPluginWindow() ? <Plugin registry={registry} /> : <Guide registry={registry} />;
}

/** Captures the library from this registry's Storybook; `attempt` retries it. */
function useLibrary(registry: Registry, attempt: number) {
  return useAsync(
    () => captureLibrary().then((library) => forRegistry(library, registry)),
    `capture:${attempt}`,
  );
}

/** The plugin window: compare the file with the registry, sync, and link items back. */
function Plugin({ registry }: { registry: Registry }) {
  const [attempt, setAttempt] = useState(0);
  const capture = useLibrary(registry, attempt);
  const [file, setFile] = useState<FileInfo | null>(null);
  const [result, setResult] = useState<ApplyResult | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onMessage = (event: MessageEvent<unknown>) => {
      const data = event.data;
      if (typeof data !== "object" || data === null || !("pluginMessage" in data)) return;
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion
      const message = data.pluginMessage as ToUi;
      setSyncing(false);
      if (message.type === "error") {
        setError(message.message);
        return;
      }
      setError(null);
      setFile(message.file);
      if (message.type === "synced") setResult(message.result);
    };
    window.addEventListener("message", onMessage);
    toPlugin({ type: "status" });
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const sync = (library: Library, allowBreaking = false) => {
    setSyncing(true);
    setResult(null);
    setError(null);
    toPlugin({ type: "sync", library, allowBreaking });
  };

  const library = capture.value;
  const pending = library && file ? changes(library, file.revisions) : [];

  return (
    <div {...stylex.props(styles.plugin)}>
      <div {...stylex.props(styles.pluginHead)}>
        <T.Muted style={styles.registry}>{registry.url}</T.Muted>
        <Button variant="ghost" size="xs" onClick={() => toPlugin({ type: "change-registry" })}>
          Change
        </Button>
      </div>

      {error && <Notice tone="error">{error}</Notice>}

      {capture.error ? (
        <div {...stylex.props(layout.section)}>
          <Notice tone="error">{capture.error.message}</Notice>
          <Button variant="outline" onClick={() => setAttempt(attempt + 1)}>
            Try again
          </Button>
        </div>
      ) : !library || !file ? (
        <div {...stylex.props(layout.section)}>
          <T.Muted>
            {library ? "Reading this file…" : "Rendering components from Storybook…"}
          </T.Muted>
          <Skeleton style={styles.skeleton} />
        </div>
      ) : (
        <>
          <section {...stylex.props(layout.section)}>
            <h1 {...stylex.props(styles.pluginTitle)}>
              {pending.length === 0
                ? "Up to date"
                : `${pending.length} ${pending.length === 1 ? "update" : "updates"}`}
            </h1>
            {pending.length > 0 && (
              <ul {...stylex.props(styles.list)}>
                {pending.map((change) => (
                  <li key={change.name} {...stylex.props(styles.change)}>
                    <span>{change.name}</span>
                    <Badge variant={change.kind === "new" ? "default" : "secondary"}>
                      {change.kind}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
            <T.Muted>
              {count(library.components.length, "component")}, {count(library.icons.length, "icon")}
              ,{" "}
              {count(
                library.foundations.collections.reduce((n, c) => n + c.variables.length, 0),
                "variable",
              )}
              .
            </T.Muted>
          </section>

          {result?.status === "confirm" ? (
            <section {...stylex.props(layout.section)}>
              <Notice tone="error">
                This sync removes things designers may use. Instances of removed variants detach.
              </Notice>
              <ul {...stylex.props(styles.list)}>
                {result.breaking.map((line) => (
                  <li key={line} {...stylex.props(text.mono)}>
                    {line}
                  </li>
                ))}
              </ul>
              <div {...stylex.props(layout.row)}>
                <Button
                  variant="destructive"
                  disabled={syncing}
                  onClick={() => sync(library, true)}
                >
                  Remove and sync
                </Button>
                <Button variant="ghost" onClick={() => setResult(null)}>
                  Cancel
                </Button>
              </div>
            </section>
          ) : (
            <Button
              variant={pending.length > 0 ? "default" : "outline"}
              disabled={syncing}
              onClick={() => sync(library)}
            >
              {syncing ? "Syncing…" : pending.length > 0 ? "Sync to Figma" : "Sync again"}
            </Button>
          )}

          {result?.status === "applied" && (
            <Notice tone="success">
              {result.summary.join(", ")}.{result.warnings.map((warning) => ` ${warning}`)}
            </Notice>
          )}

          {Object.keys(file.nodes).length > 0 && (
            <ItemLinks registry={registry} library={library} file={file} />
          )}
        </>
      )}
    </div>
  );
}

/** Item pages open this file through one `figma` block in the registry's index.json. */
function ItemLinks({
  registry,
  library,
  file,
}: {
  registry: Registry;
  library: Library;
  file: FileInfo;
}) {
  const [pasted, setPasted] = useState("");
  const nodes = figmaNodes(library, file, registry);
  const key = file.key ?? fileKey(pasted);
  const links = key ? { file: figmaFileUrl(key, file.name), nodes } : undefined;

  if (linksCurrent(registry, nodes, file.key)) {
    return <Notice tone="success">Open in Figma links are up to date.</Notice>;
  }
  return (
    <section {...stylex.props(layout.section)}>
      <h2 {...stylex.props(styles.pluginSubtitle)}>Open in Figma links</h2>
      {!file.key && (
        <>
          <T.Muted>
            Figma only tells privately installed plugins the file key. Paste this file's link
            (Share, Copy link):
          </T.Muted>
          <Input
            aria-label="This file's link"
            placeholder="https://www.figma.com/design/…"
            value={pasted}
            onChange={(event) => setPasted(event.target.value)}
          />
        </>
      )}
      {links && (
        <>
          <div {...stylex.props(styles.link)}>
            <pre {...stylex.props(text.mono, styles.block)}>{linksJson(links)}</pre>
            <CopyButton value={linksJson(links)} label="Copy figma block" />
          </div>
          <T.Muted>
            {registry.figma
              ? `Replace "figma" in the registry's index.json with this, then rebuild. `
              : `Add this to the registry's index.json, next to "items", then rebuild. `}
            Item pages then open their component in Figma.
          </T.Muted>
        </>
      )}
    </section>
  );
}

function linksJson(links: NonNullable<Registry["figma"]>): string {
  return `"figma": ${JSON.stringify(links, null, 2)}`;
}

function count(n: number, noun: string): string {
  return `${n} ${noun}${n === 1 ? "" : "s"}`;
}

/** Outside Figma: how to set up the library file, and a check that capture works. */
function Guide({ registry }: { registry: Registry }) {
  const [attempt, setAttempt] = useState(0);
  const linked = registry.items.filter((item) => item.figma);
  return (
    <div {...stylex.props(layout.stack, styles.guide)}>
      <PageHeader
        title="Figma"
        lead="The Shelf plugin builds a native Figma library from this registry: variables, text styles, icons, and components with variants and properties. Code stays the source; sync again when it changes."
      />
      <section {...stylex.props(layout.section)}>
        <T.H3>Set up the library file</T.H3>
        <T.Muted>Once per team, by whoever maintains the library.</T.Muted>
        <ol {...stylex.props(styles.steps)}>
          <li>
            Download the plugin:{" "}
            <a
              href={new URL("figma/manifest.json", registry.url).toString()}
              download="manifest.json"
              {...stylex.props(text.link)}
            >
              manifest.json
            </a>{" "}
            and{" "}
            <a
              href={new URL("figma/code.js", registry.url).toString()}
              download="code.js"
              {...stylex.props(text.link)}
            >
              code.js
            </a>
            , into one folder. In Figma, choose Plugins, Development, Import plugin from manifest,
            and select the manifest. With an Organization or Enterprise plan you can publish it
            privately to your organization instead.
          </li>
          <li>
            Open the file your team publishes as its library, run Shelf, and connect this registry.
            The file remembers it, so nobody connects it twice:
            <span {...stylex.props(styles.url)}>
              <code {...stylex.props(text.mono)}>{registry.url}</code>
              <CopyButton value={registry.url} label="Copy registry URL" />
            </span>
          </li>
          <li>Sync, then publish the file as a library.</li>
          <li>
            Copy the <code {...stylex.props(text.mono)}>figma</code> block the plugin shows into the
            registry's <code {...stylex.props(text.mono)}>index.json</code> and rebuild, so item
            pages open their component in Figma.
          </li>
        </ol>
      </section>
      <section {...stylex.props(layout.section)}>
        <T.H3>Day to day</T.H3>
        <ul {...stylex.props(styles.steps)}>
          <li>Designers enable the library and use the components; they never run the plugin.</li>
          <li>
            When code changes, the library file shows Check for Shelf updates. Syncing updates
            components in place, so instances stay linked; removals ask first. Then publish the
            library update.
          </li>
        </ul>
      </section>
      <section {...stylex.props(layout.section)}>
        <T.H3>What syncs</T.H3>
        <CaptureCheck
          registry={registry}
          attempt={attempt}
          onRetry={() => setAttempt(attempt + 1)}
        />
      </section>
      <section {...stylex.props(layout.section)}>
        <T.H3>Linked items</T.H3>
        {linked.length === 0 ? (
          <T.Muted>No item has a Figma link yet.</T.Muted>
        ) : (
          <ul {...stylex.props(styles.list)}>
            {linked.map((item) => (
              <li key={item.name}>
                <Link to="/items/$name" params={{ name: item.name }} {...stylex.props(text.link)}>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function CaptureCheck({
  registry,
  attempt,
  onRetry,
}: {
  registry: Registry;
  attempt: number;
  onRetry: () => void;
}) {
  const capture = useLibrary(registry, attempt);
  if (capture.error) {
    return (
      <div {...stylex.props(layout.section)}>
        <Notice tone="error">{capture.error.message}</Notice>
        <div>
          <Button variant="outline" onClick={onRetry}>
            Try again
          </Button>
        </div>
      </div>
    );
  }
  const library = capture.value;
  if (!library) return <Skeleton style={styles.skeleton} />;
  const variables = library.foundations.collections.reduce((n, c) => n + c.variables.length, 0);
  return (
    <div {...stylex.props(layout.section)}>
      <T.Muted>
        {variables} variables in {library.foundations.collections.length} collections,{" "}
        {library.foundations.textStyles.length} text styles,{" "}
        {library.foundations.effectStyles.length} effect styles, {library.icons.length} icons.{" "}
        <Link to="/foundations" {...stylex.props(text.link)}>
          See the foundations
        </Link>
        .
      </T.Muted>
      <ul {...stylex.props(styles.list)}>
        {library.components.map((set) => (
          <li key={set.name} {...stylex.props(styles.change)}>
            <span>{set.name}</span>
            <T.Muted>{set.variants.length} variants</T.Muted>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Notice({ tone, children }: { tone: "error" | "success"; children: ReactNode }) {
  return (
    <p role={tone === "error" ? "alert" : "status"} {...stylex.props(styles.notice, styles[tone])}>
      {tone === "error" ? <CircleAlertIcon /> : <CircleCheckIcon />}
      <span>{children}</span>
    </p>
  );
}

const styles = stylex.create({
  plugin: {
    backgroundColor: colors.background,
    boxSizing: "border-box",
    color: colors.foreground,
    display: "flex",
    flexDirection: "column",
    fontFamily: typography.fontFamily,
    gap: spacing["4"],
    minHeight: "100vh",
    padding: spacing["4"],
  },
  pluginHead: {
    alignItems: "center",
    display: "flex",
    gap: spacing["2"],
    justifyContent: "space-between",
  },
  registry: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  pluginTitle: {
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightSemibold,
    margin: 0,
  },
  pluginSubtitle: {
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightSemibold,
    margin: 0,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: spacing["1"],
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  change: {
    alignItems: "center",
    display: "flex",
    fontSize: typography.fontSizeSm,
    justifyContent: "space-between",
  },
  link: {
    alignItems: "flex-start",
    borderColor: colors.border,
    borderRadius: radius.md,
    borderStyle: "solid",
    borderWidth: 1,
    display: "flex",
    gap: spacing["2"],
    justifyContent: "space-between",
    padding: spacing["2"],
  },
  block: {
    fontSize: typography.fontSizeXs,
    margin: 0,
    minWidth: 0,
    overflowX: "auto",
  },
  notice: {
    alignItems: "flex-start",
    borderRadius: radius.md,
    display: "flex",
    fontSize: typography.fontSizeSm,
    gap: spacing["2"],
    margin: 0,
    padding: spacing["3"],
  },
  error: {
    backgroundColor: colors.muted,
    color: colors.destructiveText,
  },
  success: {
    backgroundColor: colors.muted,
    color: colors.foreground,
  },
  skeleton: {
    height: "6rem",
  },
  guide: {
    maxWidth: "48rem",
  },
  steps: {
    display: "flex",
    flexDirection: "column",
    fontSize: typography.fontSizeSm,
    gap: spacing["3"],
    lineHeight: typography.lineHeightSm,
    margin: 0,
    paddingInlineStart: spacing["6"],
  },
  url: {
    alignItems: "center",
    display: "flex",
    gap: spacing["2"],
    paddingTop: spacing["1"],
  },
});
