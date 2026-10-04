import { expect } from "storybook/test";
import preview from "@/.storybook/preview";
import * as Plan from "./plan";

const meta = preview.meta({
  title: "Components/Plan",
  component: Plan.Root,
  parameters: { layout: "padded" },
});

export const Default = meta.story({
  render: () => (
    <Plan.Root>
      <Plan.Step status="done">Read the failing test</Plan.Step>
      <Plan.Step status="active">Fix the parser</Plan.Step>
      <Plan.Step>Run the suite</Plan.Step>
    </Plan.Root>
  ),
  play: async ({ canvas }) => {
    const items = canvas.getAllByRole("listitem");
    await expect(items).toHaveLength(3);
    await expect(items[1]).toHaveAttribute("aria-current", "step");
    await expect(items[1]).toHaveTextContent("In progress");
  },
});
