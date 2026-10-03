/** Interactive states Figma variants can show, and the classes that force them. */
export const STATES = {
  hover: { name: "Hover", pseudo: ":hover", className: "shelf-figma-hover" },
  "focus-visible": {
    name: "Focus",
    pseudo: ":focus-visible",
    className: "shelf-figma-focus-visible",
  },
} as const;

export type State = keyof typeof STATES;

const STYLE_ID = "shelf-figma-states";

/**
 * Copies every `:hover` and `:focus-visible` rule on the page to a class selector, so an
 * element with the class renders that state. `(hover: hover)` media conditions are dropped:
 * they describe the pointer, not the state. Rerun after new styles are injected.
 */
export function forcePseudoStates(): void {
  const rules: string[] = [];
  for (const sheet of document.styleSheets) {
    if (sheet.ownerNode instanceof Element && sheet.ownerNode.id === STYLE_ID) continue;
    let list: CSSRuleList;
    try {
      list = sheet.cssRules;
    } catch {
      continue; // Cross-origin stylesheet.
    }
    collect(list, rules, (css) => css);
  }
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ID;
    document.head.append(style);
  }
  style.textContent = rules.join("\n");
}

function collect(list: CSSRuleList, out: string[], wrap: (css: string) => string): void {
  for (const rule of list) {
    if (rule instanceof CSSStyleRule) {
      if (!/:hover|:focus-visible/.test(rule.selectorText)) continue;
      let selector = rule.selectorText;
      for (const state of Object.values(STATES)) {
        selector = selector.replaceAll(state.pseudo, `.${state.className}`);
      }
      out.push(wrap(`${selector}{${rule.style.cssText}}`));
    } else if (rule instanceof CSSMediaRule) {
      const condition = rule.conditionText;
      collect(
        rule.cssRules,
        out,
        /\(hover:\s*hover\)/.test(condition) ? wrap : (css) => wrap(`@media ${condition}{${css}}`),
      );
    } else if (rule instanceof CSSLayerBlockRule) {
      collect(rule.cssRules, out, (css) => wrap(`@layer ${rule.name}{${css}}`));
    } else if (rule instanceof CSSSupportsRule) {
      collect(rule.cssRules, out, (css) => wrap(`@supports ${rule.conditionText}{${css}}`));
    }
  }
}
