import { expect } from "storybook/test";
import preview from "@/.storybook/preview";
import { Button } from "../button/button";
import { ButtonGroup } from "./button-group";

const meta = preview.meta({
  title: "Components/Button Group",
  component: ButtonGroup,
  parameters: { figma: {} },
});

/** Neighbouring buttons share one border. */
export const Default = meta.story({
  render: () => (
    <ButtonGroup aria-label="Invoice actions">
      <Button variant="outline">Archive</Button>
      <Button variant="outline">Report</Button>
      <Button variant="outline">Snooze</Button>
    </ButtonGroup>
  ),
  play: async ({ canvas }) => {
    const [archive, report] = canvas.getAllByRole("button");

    await expect(canvas.getByRole("group", { name: "Invoice actions" })).toBeInTheDocument();
    await expect(report!.getBoundingClientRect().left).toBe(
      archive!.getBoundingClientRect().right - 1,
    );
  },
});

/** Outside a group, buttons keep their normal spacing. */
export const OutsideAGroup = meta.story({
  render: () => (
    <div style={{ display: "flex" }}>
      <Button variant="outline">Archive</Button>
      <Button variant="outline">Report</Button>
    </div>
  ),
  play: async ({ canvas }) => {
    const [archive, report] = canvas.getAllByRole("button");

    await expect(report!.getBoundingClientRect().left).toBe(archive!.getBoundingClientRect().right);
  },
});
