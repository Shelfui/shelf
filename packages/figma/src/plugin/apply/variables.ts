import type { Library, Variable as IrVariable } from "../../ir";
import { NAMESPACE, type Context } from "./context";

interface LocalVariables {
  /** Shelf's collections by name; a designer's collection with the same name isn't one. */
  collections: Map<string, VariableCollection>;
  /** Token → variable, for variables Shelf created (their WEB code syntax is the token). */
  byToken: Map<string, Variable>;
  removed: string[];
  stale: Variable[];
  staleModes: Array<{ collection: VariableCollection; modeId: string }>;
}

export async function localVariables(figma: PluginAPI, library: Library): Promise<LocalVariables> {
  const specs = new Map(library.foundations.collections.map((spec) => [spec.name, spec]));
  const wanted = new Set(
    library.foundations.collections.flatMap((collection) =>
      collection.variables.map((variable) => variable.token),
    ),
  );
  const variables = await figma.variables.getLocalVariablesAsync();
  const collections = new Map<string, VariableCollection>();
  for (const collection of await figma.variables.getLocalVariableCollectionsAsync()) {
    const tagged = collection.getSharedPluginData(NAMESPACE, "id");
    // Synced before collections were tagged: Shelf's own variables carry its code syntax.
    const adopted =
      !tagged &&
      specs.has(collection.name) &&
      variables.some(
        (variable) =>
          variable.variableCollectionId === collection.id &&
          wanted.has(variable.codeSyntax.WEB ?? ""),
      );
    const name = tagged || (adopted ? collection.name : "");
    if (specs.has(name) && !collections.has(name)) collections.set(name, collection);
  }

  const ids = new Set([...collections.values()].map((collection) => collection.id));
  const byToken = new Map<string, Variable>();
  const stale: Variable[] = [];
  for (const variable of variables) {
    if (!ids.has(variable.variableCollectionId)) continue;
    const token = variable.codeSyntax.WEB;
    if (!token) continue;
    if (wanted.has(token)) byToken.set(token, variable);
    else stale.push(variable);
  }
  const staleModes = [...collections].flatMap(([name, collection]) =>
    collection.modes
      .filter((mode) => !specs.get(name)?.modes.includes(mode.name))
      .map((mode) => ({ collection, modeId: mode.modeId, label: `${name} mode ${mode.name}` })),
  );
  return {
    collections,
    byToken,
    stale,
    staleModes,
    removed: [
      ...stale.map((variable) => `removes variable ${variable.codeSyntax.WEB}`),
      ...staleModes.map((mode) => `removes ${mode.label}`),
    ],
  };
}

export async function syncVariables(
  figma: PluginAPI,
  library: Library,
  local: LocalVariables,
): Promise<Map<string, Variable>> {
  const result = new Map<string, Variable>();
  for (const spec of library.foundations.collections) {
    const found = local.collections.get(spec.name);
    const collection = found ?? figma.variables.createVariableCollection(spec.name);
    collection.setSharedPluginData(NAMESPACE, "id", spec.name);
    const modes = new Map<string, string>();
    for (const [i, mode] of spec.modes.entries()) {
      const existing = collection.modes.find((candidate) => candidate.name === mode);
      // A new collection starts with one default mode; it becomes the first.
      const initial = !found && i === 0 ? collection.modes[0] : undefined;
      if (existing) {
        modes.set(mode, existing.modeId);
      } else if (initial) {
        collection.renameMode(initial.modeId, mode);
        modes.set(mode, initial.modeId);
      } else {
        modes.set(mode, collection.addMode(mode));
      }
    }
    for (const wanted of specVariables(library, collection.name)) {
      const variable =
        local.byToken.get(wanted.token) ??
        figma.variables.createVariable(wanted.name, collection, wanted.type);
      if (variable.name !== wanted.name) variable.name = wanted.name;
      variable.scopes = wanted.scopes;
      variable.setVariableCodeSyntax("WEB", wanted.token);
      if (wanted.description !== undefined) variable.description = wanted.description;
      for (const [mode, value] of Object.entries(wanted.values)) {
        const modeId = modes.get(mode);
        if (modeId) variable.setValueForMode(modeId, value);
      }
      result.set(wanted.token, variable);
    }
  }
  for (const variable of local.stale) variable.remove();
  for (const { collection, modeId } of local.staleModes) collection.removeMode(modeId);
  return result;
}

function specVariables(library: Library, collection: string): IrVariable[] {
  return library.foundations.collections.find((spec) => spec.name === collection)?.variables ?? [];
}

/** The first mode's value of a token's variable. */
export function valueOf(context: Context, token: string): VariableValue {
  const variable = context.variables.get(token);
  if (!variable) throw new Error(`No variable for ${token}.`);
  const first = Object.values(variable.valuesByMode)[0];
  if (first === undefined) throw new Error(`${token} has no value.`);
  return first;
}
