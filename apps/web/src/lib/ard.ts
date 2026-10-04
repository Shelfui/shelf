import { siteConfig } from "@/site";

/**
 * The resources Shelf offers to agents, in the Agentic Resource Discovery format:
 * https://agenticresourcediscovery.org/spec/
 */
export function ardManifest() {
  return {
    specVersion: "1.0",
    host: { displayName: siteConfig.name },
    entries: [
      {
        identifier: "urn:air:shelfui.dev:registry:shelf",
        displayName: "Shelf Registry",
        type: "application/json",
        url: `${siteConfig.registryUrl}index.json`,
        description:
          "Every component and block Shelf publishes, with its revision, files, and package and Shelf dependencies. `shelf add` installs them as source.",
        representativeQueries: [
          "Which UI components can I install with Shelf?",
          "What does the Shelf dialog component depend on?",
          "Find a command palette or chat component for React",
        ],
      },
      {
        identifier: "urn:air:shelfui.dev:docs:shelf",
        displayName: "Shelf documentation",
        type: "text/markdown",
        url: `${siteConfig.url}/llms.txt`,
        description:
          "An index of the Shelf docs and every component page. Append .md to any docs URL for its Markdown.",
        representativeQueries: [
          "How do I install Shelf in a Next.js or Vite project?",
          "How does Shelf track changes I make to installed components?",
          "How do I use the Shelf CLI?",
        ],
      },
      {
        identifier: "urn:air:shelfui.dev:skill:shelf",
        displayName: "Shelf agent skill",
        type: "application/ai-skill+md",
        url: `${siteConfig.repoUrl}/blob/main/skills/shelf/SKILL.md`,
        description:
          "Teaches a coding agent to search, add, update, and check Shelf components in a project.",
        representativeQueries: [
          "Add a Shelf component to this project",
          "Update my Shelf components without losing local changes",
        ],
      },
    ],
  };
}
