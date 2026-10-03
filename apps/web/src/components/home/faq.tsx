import * as stylex from "@stylexjs/stylex";
import * as Accordion from "@/components/ui/accordion";
import { colors, spacing, typography } from "@/styles/shelf/tokens.stylex";
import { screens, site } from "@/styles/site.stylex";

const QUESTIONS = [
  {
    id: "package",
    question: "How is this different from a component package?",
    answer:
      "A package ships compiled code, so a product that needs different spacing or color overrides it from the outside, and those overrides break when the package changes. Shelf copies the source into each product instead. The product edits the style where it is defined, and Shelf still tracks the copy against the registry.",
  },
  {
    id: "drift",
    question: "If products can edit their copy, won't they drift apart?",
    answer:
      "Files nobody edited stay identical to the registry and update as-is. When a product does edit one, shelf status shows it in that product and shelf usage shows it across all of them. Edited files still take upstream fixes, so a difference is a decision you can see, not a fork.",
  },
  {
    id: "updates",
    question: "How do updates reach files we changed?",
    answer:
      "shelf update compares three versions: what was installed, your file, and the registry's current file. Untouched files are replaced. Edited files are merged with git merge-file, and only overlapping edits get conflict markers. shelf check fails until they are resolved.",
  },
  {
    id: "stack",
    question: "What does a project need to use it?",
    answer:
      "React, with StyleX compiling in the build. The installation guide covers Vite, and this site runs on Next. Shelf works with npm, pnpm, yarn, and Bun, and uses whichever your lockfile names.",
  },
  {
    id: "hosting",
    question: "Can we run a private registry?",
    answer:
      "Yes. shelf build writes your registry as plain files for any static host, including one behind your sign-in. Tokens come from environment variables and are only sent over HTTPS.",
  },
  {
    id: "agents",
    question: "How do coding agents fit in?",
    answer:
      "Agents read and change the actual component file instead of wrapping a package. shelf search finds an existing item before they build a new one, and shelf check names the file and the command that fixes a failure.",
  },
  {
    id: "accessibility",
    question: "Are the components accessible?",
    answer:
      "Focus, keyboard, and ARIA behavior come from Base UI, and every component is tested for accessibility in Storybook. Once you change a component, your own tests cover your version.",
  },
  {
    id: "leave",
    question: "What happens if we stop using Shelf?",
    answer:
      "Delete shelf.config.json, the .shelf folder, and the @shelfui/cli package. The components keep working, because they are your code.",
  },
];

export function Faq() {
  return (
    <Accordion.Root style={styles.root}>
      {QUESTIONS.map((item) => (
        <Accordion.Item key={item.id} value={item.id}>
          <Accordion.Trigger style={styles.trigger}>{item.question}</Accordion.Trigger>
          <Accordion.Panel style={styles.answer}>{item.answer}</Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}

const styles = stylex.create({
  root: {
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: 1,
  },
  trigger: {
    fontSize: { default: typography.fontSizeLg, [screens.md]: site.fontSizeXl },
    fontWeight: typography.fontWeightRegular,
    letterSpacing: "-0.01em",
    lineHeight: 1.375,
    paddingBlock: spacing["6"],
  },
  answer: {
    color: colors.mutedForeground,
    fontSize: typography.fontSizeLg,
    lineHeight: 1.5,
    maxWidth: "40rem",
    paddingBottom: spacing["6"],
    textWrap: "pretty",
  },
});
