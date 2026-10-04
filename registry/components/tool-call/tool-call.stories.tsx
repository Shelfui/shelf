import { expect, userEvent } from "storybook/test";
import preview from "@/.storybook/preview";
import type { ToolPart } from "../message/message-types";
import { ToolCall } from "./tool-call";

const meta = preview.meta({
  title: "Components/ToolCall",
  component: ToolCall,
  parameters: { layout: "padded" },
});

const done: ToolPart = {
  type: "tool-getWeather",
  toolCallId: "1",
  state: "output-available",
  input: { city: "Stockholm" },
  output: { tempC: 7, sky: "overcast" },
};

export const Done = meta.story({
  args: { part: done },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("getWeather")).toBeVisible();
    await expect(canvas.getByText("Done")).toBeVisible();
    const trigger = canvas.getByRole("button", { name: /getWeather/ });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  },
});

export const Running = meta.story({
  args: { part: { ...done, state: "input-available", output: undefined } },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Running")).toBeVisible();
  },
});

export const Failed = meta.story({
  args: {
    part: { ...done, state: "output-error", output: undefined, errorText: "City not found" },
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: /getWeather/ }));
    await expect(await canvas.findByRole("alert")).toHaveTextContent("City not found");
  },
});
