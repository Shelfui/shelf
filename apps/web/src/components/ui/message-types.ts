/**
 * The shapes the chat items share. They are structural: a message from the AI SDK's `useChat`
 * (`UIMessage`) can be passed wherever a `ChatMessage` is expected, and so can anything else
 * with the same fields. Shelf imports no chat library.
 */

/** Where a turn is, as `useChat` reports it. */
export type ChatStatus = "ready" | "submitted" | "streaming" | "error";

export type ChatRole = "user" | "assistant" | "system";

/** Lifecycle of a tool call. `approval-*` and `output-denied` appear when a person must approve it. */
export type ToolState =
  | "input-streaming"
  | "input-available"
  | "approval-requested"
  | "approval-responded"
  | "output-available"
  | "output-error"
  | "output-denied";

export interface TextPart {
  type: "text";
  text: string;
  state?: "streaming" | "done";
}

export interface ReasoningPart {
  type: "reasoning";
  text: string;
  state?: "streaming" | "done";
}

export interface SourceUrlPart {
  type: "source-url";
  sourceId: string;
  url: string;
  title?: string;
}

export interface FilePart {
  type: "file";
  mediaType: string;
  url: string;
  filename?: string;
}

export interface StepStartPart {
  type: "step-start";
}

export interface ToolApproval {
  id: string;
  approved?: boolean;
  reason?: string;
}

interface ToolFields {
  toolCallId: string;
  state: ToolState;
  input?: unknown;
  output?: unknown;
  errorText?: string;
  approval?: ToolApproval;
}

/** A call to a tool the app defined: the type is `tool-` plus the tool's name. */
export interface ToolPart extends ToolFields {
  type: `tool-${string}`;
}

/** A call to a tool discovered at runtime, such as one from an MCP server. */
export interface DynamicToolPart extends ToolFields {
  type: "dynamic-tool";
  toolName: string;
}

/** App-defined structured data that travels with the message, such as `data-weather`. */
export interface DataPart {
  type: `data-${string}`;
  id?: string;
  data: unknown;
}

export type ChatPart =
  | TextPart
  | ReasoningPart
  | SourceUrlPart
  | FilePart
  | StepStartPart
  | ToolPart
  | DynamicToolPart
  | DataPart;

export interface ChatMessage {
  id: string;
  role: ChatRole;
  parts: ChatPart[];
}

/** The tool's name, from a tool part. */
export function toolName(part: ToolPart | DynamicToolPart): string {
  return part.type === "dynamic-tool" ? part.toolName : part.type.slice("tool-".length);
}

export function isToolPart(part: ChatPart): part is ToolPart | DynamicToolPart {
  return part.type === "dynamic-tool" || part.type.startsWith("tool-");
}

/** The message's visible text, joined across text parts. For copy buttons and plain-text uses. */
export function textOf(message: ChatMessage): string {
  return message.parts
    .flatMap((part) => (part.type === "text" ? [part.text] : []))
    .join("\n\n")
    .trim();
}
