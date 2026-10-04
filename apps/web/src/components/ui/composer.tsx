"use client";

import type { Editor, Extensions } from "@tiptap/core";
import * as stylex from "@stylexjs/stylex";
import {
  type ComponentProps,
  createContext,
  lazy,
  type ReactNode,
  Suspense,
  use,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { colors, elevation, radius, spacing, typography } from "@/styles/shelf/tokens.stylex";
import type { Styled } from "@/lib/shelf/utils";
import { Attachment, useFileUrl } from "./attachment";
import { Button } from "./button";
import * as Dropzone from "./dropzone";
import { ArrowUpIcon, AttachIcon, StopIcon } from "./icons";
import type { SuggestionItem } from "./editor-suggestion";
import type { ChatStatus } from "./message-types";

export type { Extensions };

/** What the person sent. */
export interface Submission {
  /** The message, trimmed. A mention reads as `@name`. */
  text: string;
  /** The mentions and other chips in the message, in order. */
  chips: Chip[];
  /** Files attached since the last send. */
  files: File[];
}

/** A mention, tag, or other reference inside the text. */
export interface Chip {
  /** What kind it is, such as `user` or `file`. */
  kind: string;
  id: string;
  label: string;
}

/** How the root reaches into whichever input is mounted. */
export interface InputHandle {
  clear: () => void;
  focus: () => void;
}

interface State {
  text: string;
  chips: readonly Chip[];
  files: readonly File[];
  status: ChatStatus;
  /** A reply is on its way: the send button becomes a stop button. */
  busy: boolean;
  /** There is something to send and nothing in the way. */
  canSubmit: boolean;
  disabled: boolean;
}

interface Actions {
  setText: (text: string, chips?: Chip[]) => void;
  /** Sends the message if there is one. Returns `true` if it was sent. */
  submit: () => boolean;
  stop: () => void;
  addFiles: (files: File[]) => void;
  removeFile: (file: File) => void;
  focus: () => void;
  /** For inputs: tell the root how to clear and focus them. */
  registerInput: (handle: InputHandle | null) => void;
}

/** The Tiptap editor once it has loaded; `null` while the textarea is showing. */
export const EditorContext = createContext<Editor | null>(null);

const StateContext = createContext<State | null>(null);
const ActionsContext = createContext<Actions | null>(null);

/** Reads from the composer. Re-renders only when the selected value changes. */
export function useComposerState<T>(select: (state: State) => T): T {
  const state = use(StateContext);
  if (!state) throw new Error("Composer parts must be used inside <Composer.Root>.");
  return select(state);
}

/** Stable actions for the composer. Never re-renders its caller. */
export function useComposerActions(): Actions {
  const actions = use(ActionsContext);
  if (!actions) throw new Error("Composer parts must be used inside <Composer.Root>.");
  return actions;
}

export interface RootProps extends Styled<Omit<ComponentProps<"div">, "children" | "onSubmit">> {
  /** Text to start with, such as a message being edited. Read once, when the composer mounts. */
  defaultText?: string;
  /** Where the conversation is. While `submitted` or `streaming`, send becomes stop. */
  status?: ChatStatus;
  onSubmit: (submission: Submission) => void;
  /** Called by the stop button and by Escape while a reply is on its way. */
  onStop?: () => void;
  /** Accepted file types for attachments, such as `{ "image/*": [] }`. Anything by default. */
  accept?: Dropzone.Accept;
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  children: ReactNode;
}

/**
 * The message box. Holds the text and attached files, and sends them on Enter or the send
 * button. Files can be dropped on it or pasted into it.
 *
 *   <Composer.Root status={status} onSubmit={send} onStop={stop}>
 *     <Composer.Files />
 *     <Composer.Input placeholder="Ask anything" />
 *     <Composer.Footer>
 *       <Composer.Attach />
 *       <Composer.Submit />
 *     </Composer.Footer>
 *   </Composer.Root>
 */
export function Root({
  defaultText = "",
  status = "ready",
  onSubmit,
  onStop,
  accept,
  maxSize,
  maxFiles,
  disabled = false,
  style,
  children,
  onKeyDown,
  ...props
}: RootProps) {
  const [text, setTextOnly] = useState(defaultText);
  const [chips, setChips] = useState<readonly Chip[]>([]);
  const [files, setFiles] = useState<readonly File[]>([]);
  const input = useRef<InputHandle | null>(null);

  const busy = status === "submitted" || status === "streaming";
  const canSubmit = !disabled && !busy && (text.trim() !== "" || files.length > 0);
  const state = useMemo<State>(
    () => ({ text, chips, files, status, busy, canSubmit, disabled }),
    [text, chips, files, status, busy, canSubmit, disabled],
  );

  // Actions stay the same object, so typing never re-renders a button that only calls them.
  const latest = useRef({ state, onSubmit, onStop });
  useEffect(() => {
    latest.current = { state, onSubmit, onStop };
  });
  const actions = useMemo<Actions>(
    () => ({
      setText: (next, nextChips = []) => {
        setTextOnly(next);
        setChips(nextChips);
      },
      submit: () => {
        const { state: current, onSubmit: send } = latest.current;
        if (!current.canSubmit) return false;
        send({
          text: current.text.trim(),
          chips: [...current.chips],
          files: [...current.files],
        });
        setTextOnly("");
        setChips([]);
        setFiles([]);
        input.current?.clear();
        return true;
      },
      stop: () => latest.current.onStop?.(),
      addFiles: (added) => setFiles((existing) => [...existing, ...added]),
      removeFile: (file) => setFiles((existing) => existing.filter((f) => f !== file)),
      focus: () => input.current?.focus(),
      registerInput: (handle) => {
        input.current = handle;
      },
    }),
    [],
  );

  return (
    <ActionsContext value={actions}>
      <StateContext value={state}>
        <Dropzone.Root
          onFiles={actions.addFiles}
          accept={accept}
          maxSize={maxSize}
          maxFiles={maxFiles}
          disabled={disabled}
          data-slot="composer"
          data-busy={busy || undefined}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.key === "Escape" && busy && !event.defaultPrevented) actions.stop();
          }}
          {...props}
          style={[styles.root, style]}
        >
          {children}
          <Dropzone.Overlay>Drop files to attach</Dropzone.Overlay>
          <Dropzone.Rejections />
        </Dropzone.Root>
      </StateContext>
    </ActionsContext>
  );
}

const loadEditor = () => import("./composer-editor");
const LazyEditor = lazy(loadEditor);
let editorLoad: Promise<unknown> | undefined;

/** Starts loading the rich input. Called for you on idle and when the input is touched. */
export function preloadComposerInput(): Promise<unknown> {
  editorLoad ??= loadEditor().catch((error: unknown) => {
    editorLoad = undefined;
    throw error;
  });
  return editorLoad;
}

export interface InputProps {
  placeholder?: string;
  /** Accessible name. */
  label?: string;
  autoFocus?: boolean;
  /**
   * Tiptap extensions to add, such as `Mention` or your own. Read once, when the editor mounts.
   * Enter submits unless an extension handles it first, as a suggestion menu does.
   */
  extensions?: Extensions;
  /** Plugins that need the editor, such as `Composer.Mention`. They appear once it has loaded. */
  children?: ReactNode;
  style?: stylex.StaticStyles;
}

/**
 * The text field. It is a plain textarea at first, so it works the moment the page does, and
 * becomes a Tiptap editor as soon as that has loaded, keeping the text, caret, and focus.
 * Enter sends, Shift+Enter adds a line, and Enter during IME composition does neither.
 */
export function Input({
  placeholder = "Message",
  label = "Message",
  autoFocus = false,
  extensions = NO_EXTENSIONS,
  children,
  style,
}: InputProps) {
  const { setText, submit, addFiles, registerInput } = useComposerActions();
  const text = useComposerState((s) => s.text);
  const disabled = useComposerState((s) => s.disabled);
  const [ready, setReady] = useState(false);
  const [focused, setFocused] = useState(autoFocus);

  useEffect(() => {
    let current = true;
    const load = () => {
      void preloadComposerInput().then(
        () => current && setReady(true),
        () => {
          // The textarea keeps working.
        },
      );
    };
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(load, { timeout: 3000 });
      return () => {
        current = false;
        window.cancelIdleCallback(id);
      };
    }
    const id = setTimeout(load, 1000);
    return () => {
      current = false;
      clearTimeout(id);
    };
  }, []);

  const warm = () => {
    preloadComposerInput().then(
      () => setReady(true),
      () => {},
    );
  };

  const fallback = (
    <textarea
      rows={1}
      aria-label={label}
      placeholder={placeholder}
      disabled={disabled}
      value={text}
      data-slot="composer-input"
      // oxlint-disable-next-line jsx-a11y/no-autofocus
      autoFocus={autoFocus}
      ref={(element) => {
        registerInput(element ? { clear: () => {}, focus: () => element.focus() } : null);
        return () => registerInput(null);
      }}
      onFocus={() => {
        setFocused(true);
        warm();
      }}
      onBlur={() => setFocused(false)}
      onChange={(event) => setText(event.target.value)}
      onPaste={(event) => {
        const files = Array.from(event.clipboardData.files);
        if (files.length === 0) return;
        event.preventDefault();
        addFiles(files);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
          event.preventDefault();
          submit();
        }
      }}
      {...stylex.props(styles.input, styles.textarea, style)}
    />
  );

  // Never swap under the caret: a person typing in the textarea keeps it until they leave,
  // unless the input asked for focus on mount, where nothing has been typed yet.
  if (!ready || (focused && !autoFocus)) return fallback;
  return (
    <Suspense fallback={fallback}>
      <LazyEditor
        initialText={text}
        placeholder={placeholder}
        label={label}
        disabled={disabled}
        autoFocus={focused}
        extensions={extensions}
        className={stylex.props(styles.input, style).className ?? ""}
        onChange={setText}
        onEnter={submit}
        onFiles={addFiles}
        onHandle={registerInput}
      >
        {children}
      </LazyEditor>
    </Suspense>
  );
}

const NO_EXTENSIONS: Extensions = [];

/** The Tiptap editor, once it has loaded. For your own plugins inside `Composer.Input`. */
export const useComposerEditor = (): Editor | null => use(EditorContext);

export interface MentionProps<T extends SuggestionItem = SuggestionItem> {
  /** The choices for what was typed after the trigger. May be async. */
  items(query: string, signal: AbortSignal): readonly T[] | Promise<readonly T[]>;
  /** Trigger character. `@` by default. */
  char?: string;
  /** What kind of thing it mentions, kept on the chip: `Submission.chips[].kind`. */
  kind?: string;
  "aria-label"?: string;
}

export interface CommandProps<T extends SuggestionItem = SuggestionItem> {
  items(query: string, signal: AbortSignal): readonly T[] | Promise<readonly T[]>;
  /** Runs the chosen command. The typed `/query` is removed first. */
  onCommand(item: T): void;
  /** Trigger character. `/` by default. */
  char?: string;
  "aria-label"?: string;
}

const MentionMenu = lazy(() =>
  import("./composer-suggestions").then((m) => ({ default: m.Mention })),
);
const CommandMenu = lazy(() =>
  import("./composer-suggestions").then((m) => ({ default: m.Command })),
);

/**
 * `@`-style mentions. The choice becomes a chip in the text and in `Submission.chips`.
 *
 *   <Composer.Input>
 *     <Composer.Mention kind="user" items={(query) => searchPeople(query)} />
 *   </Composer.Input>
 */
export function Mention<T extends SuggestionItem>(props: MentionProps<T>) {
  return (
    <Suspense fallback={null}>
      <MentionMenu {...props} />
    </Suspense>
  );
}

/** `/`-style commands. The choice runs `onCommand` and leaves no text behind. */
export function Command<T extends SuggestionItem>(props: CommandProps<T>) {
  return (
    <Suspense fallback={null}>
      <CommandMenu {...props} />
    </Suspense>
  );
}

/** The row under the input, for buttons. */
export function Footer({ style, ...props }: Styled<ComponentProps<"div">>) {
  return <div data-slot="composer-footer" {...props} {...stylex.props(styles.footer, style)} />;
}

/** Opens the file picker. */
export function Attach({ children, ...props }: ComponentProps<typeof Button>) {
  const { open } = Dropzone.useDropzoneActions();
  const disabled = useComposerState((s) => s.disabled);
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label="Attach files"
      disabled={disabled}
      onClick={open}
      {...props}
    >
      {children ?? <AttachIcon />}
    </Button>
  );
}

/** Sends the message; while a reply is on its way it stops it instead. */
export function Submit({ style, ...props }: Styled<ComponentProps<typeof Button>>) {
  const { submit, stop } = useComposerActions();
  const busy = useComposerState((s) => s.busy);
  const canSubmit = useComposerState((s) => s.canSubmit);
  return (
    <Button
      size="icon-sm"
      aria-label={busy ? "Stop generating" : "Send message"}
      disabled={!busy && !canSubmit}
      onClick={() => (busy ? stop() : submit())}
      data-slot="composer-submit"
      {...props}
      style={[styles.submit, style]}
    >
      {busy ? <StopIcon /> : <ArrowUpIcon />}
    </Button>
  );
}

/** Files waiting to be sent, each with a remove button. Renders nothing when there are none. */
export function Files({ style, ...props }: Styled<ComponentProps<"ul">>) {
  const files = useComposerState((s) => s.files);
  const { removeFile } = useComposerActions();
  if (files.length === 0) return null;
  return (
    <ul
      aria-label="Attachments"
      data-slot="composer-files"
      {...props}
      {...stylex.props(styles.files, style)}
    >
      {files.map((file, index) => (
        // The same file can be attached twice, so the position is part of its identity.
        // oxlint-disable-next-line react/no-array-index-key
        // react-doctor-disable-next-line react-doctor/no-array-index-as-key
        <li key={`${index}:${file.name}`}>
          <FileChip file={file} onRemove={() => removeFile(file)} />
        </li>
      ))}
    </ul>
  );
}

function FileChip({ file, onRemove }: { file: File; onRemove: () => void }) {
  return <Attachment name={file.name} previewUrl={useFileUrl(file)} onRemove={onRemove} />;
}

const styles = stylex.create({
  root: {
    padding: spacing["2"],
    borderColor: { default: colors.input, ":focus-within": colors.ring },
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    gap: spacing["2"],
    backgroundColor: colors.background,
    boxShadow: elevation.sm,
    color: colors.foreground,
    display: "flex",
    flexDirection: "column",
  },
  input: {
    borderStyle: "none",
    borderWidth: 0,
    outline: "none",
    paddingBlock: spacing["1"],
    paddingInline: spacing["2"],
    backgroundColor: "transparent",
    color: colors.foreground,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeBase,
    lineHeight: typography.lineHeightBase,
    overflowWrap: "anywhere",
    maxHeight: "12rem",
    minHeight: "1.5rem",
    overflowY: "auto",
    width: "100%",
  },
  textarea: {
    fieldSizing: "content",
    margin: 0,
    boxSizing: "border-box",
    resize: "none",
  },
  footer: {
    gap: spacing["1"],
    alignItems: "center",
    display: "flex",
  },
  submit: {
    marginInlineStart: "auto",
  },
  files: {
    margin: 0,
    padding: 0,
    gap: spacing["1"],
    listStyle: "none",
    display: "flex",
    flexWrap: "wrap",
  },
});
