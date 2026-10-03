type Reexport =
  | { kind: "named"; specifier: string; pairs: Array<{ local: string; exported: string }> }
  | { kind: "namespace"; specifier: string; name: string }
  | { kind: "star"; specifier: string };

export function reexports(content: string): Reexport[] {
  const found: Reexport[] = [];
  const pattern =
    /\bexport\s+(type\s+)?(\*\s*as\s+([\w$]+)|\*|\{([^}]*)\})\s*from\s*(["'])([^"'\n]+)\5/g;
  for (const match of content.matchAll(pattern)) {
    if (match[1]) continue;
    const specifier = match[6]!;
    if (match[3]) found.push({ kind: "namespace", specifier, name: match[3] });
    else if (match[4] === undefined) found.push({ kind: "star", specifier });
    else {
      const pairs = match[4]
        .split(",")
        .map((part) => part.trim())
        .filter((part) => part && !part.startsWith("type "))
        .map((part) => {
          const [local, exported] = part.split(/\s+as\s+/);
          return { local: local!, exported: exported ?? local! };
        });
      found.push({ kind: "named", specifier, pairs });
    }
  }
  return found;
}

export function exportedNames(content: string): Set<string> {
  const names = new Set<string>();
  const declaration =
    /\bexport\s+(?:declare\s+)?(?:async\s+)?(?:function\*?|const|let|var|class|interface|type|enum)\s+([\w$]+)/g;
  for (const match of content.matchAll(declaration)) names.add(match[1]!);
  for (const match of content.matchAll(/\bexport\s*\{([^}]*)\}/g)) {
    for (const part of match[1]!.split(",")) {
      const name = part
        .trim()
        .split(/\s+as\s+/)
        .at(-1);
      if (name) names.add(name.replace(/^type\s+/, ""));
    }
  }
  return names;
}
