import { CONFIG_FILE } from "./config";
import { ShelfError } from "./errors";
import { isObject } from "./json";

export interface GitHub {
  token: string;
  /** REST API root, e.g. https://api.github.com. */
  api: string;
  /** Where repositories are cloned from, e.g. https://github.com. */
  server: string;
}

/** GitHub settings from the environment GitHub Actions and the gh CLI use. */
export function gitHubFromEnv(env: NodeJS.ProcessEnv = process.env): GitHub | undefined {
  const token = env["GH_TOKEN"] || env["GITHUB_TOKEN"];
  if (!token) return undefined;
  return {
    token,
    api: (env["GITHUB_API_URL"] || "https://api.github.com").replace(/\/$/, ""),
    server: (env["GITHUB_SERVER_URL"] || "https://github.com").replace(/\/$/, ""),
  };
}

const PAGE_SIZE = 100;
/** GitHub's code search returns at most 1,000 results. */
const MAX_PAGES = 10;

/** Clone URLs of the repositories in `org` that have a shelf.config.json, sorted. */
export async function shelfRepos(github: GitHub, org: string): Promise<string[]> {
  const names = new Set<string>();
  for (let page = 1; page <= MAX_PAGES; page++) {
    const query = encodeURIComponent(`filename:${CONFIG_FILE} org:${org}`);
    const url = `${github.api}/search/code?q=${query}&per_page=${PAGE_SIZE}&page=${page}`;
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${github.token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) throw new ShelfError(searchError(response, org));
    const body: unknown = await response.json();
    const items: unknown[] = isObject(body) && Array.isArray(body["items"]) ? body["items"] : [];
    for (const item of items) {
      const repository = isObject(item) ? item["repository"] : undefined;
      const name = isObject(repository) ? repository["full_name"] : undefined;
      if (typeof name === "string") names.add(name);
    }
    if (items.length < PAGE_SIZE) break;
  }
  return [...names].toSorted().map((name) => `${github.server}/${name}.git`);
}

function searchError(response: Response, org: string): string {
  const status = `${response.status} ${response.statusText}`.trim();
  if (response.status === 401) {
    return `GitHub rejected the token (${status}). Set GH_TOKEN or GITHUB_TOKEN to a valid token.`;
  }
  if (response.status === 403 || response.status === 429) {
    return `GitHub refused the search in ${org} (${status}). The token may lack access to the org, or the search rate limit was hit; wait a minute and retry.`;
  }
  if (response.status === 422) {
    return `GitHub could not search "${org}" (${status}). Check that the organization exists and the token can read it.`;
  }
  return `GitHub search in ${org} failed: ${status}.`;
}

/**
 * Git config, as environment variables, that sends the token to `github.server` only. The token
 * stays out of clone URLs, process arguments, and error messages.
 */
export function gitAuthEnv(github: GitHub): Record<string, string> {
  const basic = Buffer.from(`x-access-token:${github.token}`).toString("base64");
  return {
    GIT_CONFIG_COUNT: "1",
    GIT_CONFIG_KEY_0: `http.${github.server}/.extraHeader`,
    GIT_CONFIG_VALUE_0: `Authorization: Basic ${basic}`,
  };
}

/** One key for every way of writing a repository's URL, so the same repo is scanned once. */
export function repoKey(url: string): string {
  return url
    .trim()
    .replace(/^[a-z][a-z0-9+.-]*:\/\//i, "")
    .replace(/^[^@/]+@/, "")
    .replace(/^([^/:]+):(?!\d)/, "$1/")
    .replace(/\/+$/, "")
    .replace(/\.git$/, "")
    .toLowerCase();
}
