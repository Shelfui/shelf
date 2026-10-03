import { useState } from "react";
import { expect, fn, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import * as Dropzone from "./dropzone";

const meta = preview.meta({
  title: "Components/Dropzone",
  component: Dropzone.Root,
  parameters: { layout: "padded" },
  args: { children: null, onFiles: fn(), onReject: fn() },
});

function Example(props: Omit<Dropzone.RootProps, "children">) {
  const [names, setNames] = useState<string[]>([]);
  return (
    <div style={{ maxWidth: 420 }}>
      <Dropzone.Root
        {...props}
        onFiles={(files) => {
          props.onFiles(files);
          setNames(files.map((file) => file.name));
        }}
      >
        <Dropzone.Area>Drop images here, or press to choose</Dropzone.Area>
        <Dropzone.Overlay />
        <Dropzone.Rejections />
      </Dropzone.Root>
      <p>{names.length > 0 ? `Added ${names.join(", ")}` : null}</p>
    </div>
  );
}

export const Default = meta.story({
  args: { accept: { "image/*": [] }, maxSize: 1000 },
  render: ({ children: _children, ...args }) => <Example {...args} />,
  play: async ({ canvas, canvasElement, args }) => {
    const input = canvasElement.querySelector<HTMLInputElement>("input[type=file]")!;
    const ok = new File(["x"], "ok.png", { type: "image/png" });
    const wrongType = new File(["x"], "notes.txt", { type: "text/plain" });
    await userEvent.upload(input, [ok, wrongType], { applyAccept: false });
    await waitFor(() => expect(args.onFiles).toHaveBeenCalledTimes(1));
    await expect(await canvas.findByText("Added ok.png")).toBeVisible();
    await expect(await canvas.findByText("notes.txt isn't a supported type")).toBeVisible();
  },
});

export const Disabled = meta.story({
  args: { disabled: true },
  render: ({ children: _children, ...args }) => (
    <Dropzone.Root {...args}>
      <Dropzone.Area>Uploads are off</Dropzone.Area>
    </Dropzone.Root>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Uploads are off" })).toBeDisabled();
  },
});
