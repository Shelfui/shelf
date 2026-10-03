"use client";

import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { media } from "../../foundations/conditions.stylex";
import { motion } from "../../foundations/tokens.stylex";
import { type Styled, isTransitioning } from "../../lib/utils";

/**
 * A section that shows and hides its panel. The trigger is unstyled so any button works:
 *
 *   <Collapsible.Root>
 *     <Collapsible.Trigger render={<Button variant="ghost" />}>Show details</Collapsible.Trigger>
 *     <Collapsible.Panel>…</Collapsible.Panel>
 *   </Collapsible.Root>
 */
export const Root = BaseCollapsible.Root;
export const Trigger = BaseCollapsible.Trigger;

export function Panel({ style, ...props }: Styled<ComponentProps<typeof BaseCollapsible.Panel>>) {
  return (
    <BaseCollapsible.Panel
      data-slot="collapsible-panel"
      {...props}
      className={(state) =>
        stylex.props(styles.panel, isTransitioning(state) && styles.closed, style).className
      }
    />
  );
}

const styles = stylex.create({
  panel: {
    overflow: "hidden",
    transitionDuration: {
      default: motion.durationFast,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "height",
    transitionTimingFunction: motion.easingStandard,
    height: "var(--collapsible-panel-height)",
  },
  closed: {
    height: 0,
  },
});
