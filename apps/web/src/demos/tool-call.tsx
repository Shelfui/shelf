import type { ToolPart } from "@/components/ui/message-types";
import { ToolCall } from "@/components/ui/tool-call";

const part: ToolPart = {
  type: "tool-getWeather",
  toolCallId: "1",
  state: "output-available",
  input: { city: "Stockholm" },
  output: { tempC: 7, sky: "overcast" },
};

export default function ToolCallDemo() {
  return <ToolCall part={part} />;
}
