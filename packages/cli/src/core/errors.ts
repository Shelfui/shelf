/** A user-facing failure. The message must say what went wrong and how to fix it. */
export class ShelfError extends Error {
  override name = "ShelfError";
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
