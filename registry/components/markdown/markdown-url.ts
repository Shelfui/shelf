// Control characters and whitespace that browsers ignore inside a URL scheme (`java\nscript:`).
// oxlint-disable-next-line no-control-regex
const IGNORED = /[\u0000-\u0020\u007f-\u009f\u200b-\u200f\u2028\u2029\ufeff]/g;

const SCHEME = /^([a-z][a-z0-9+.-]*):/i;

/**
 * The link target if it is safe to render, otherwise `undefined`. Allows `http`, `https`,
 * `mailto`, and relative URLs. Model output is untrusted: it can carry any URL.
 */
export function safeUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const cleaned = url.replace(IGNORED, "");
  if (!cleaned) return undefined;
  const scheme = SCHEME.exec(cleaned)?.[1]?.toLowerCase();
  if (scheme === undefined) return cleaned;
  return scheme === "http" || scheme === "https" || scheme === "mailto" ? cleaned : undefined;
}

/** `true` when `url` is an `http(s)` URL on one of `origins` (such as `https://cdn.example.com`). */
export function isAllowedImage(url: string | undefined, origins: readonly string[]): boolean {
  if (!url || origins.length === 0) return false;
  try {
    const parsed = new URL(url);
    return (
      (parsed.protocol === "https:" || parsed.protocol === "http:") &&
      origins.includes(parsed.origin)
    );
  } catch {
    return false;
  }
}
