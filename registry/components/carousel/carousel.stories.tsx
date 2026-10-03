import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";
import { expect, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import { colors, radius, typography } from "../../foundations/tokens.stylex";
import * as Carousel from "./carousel";

const meta = preview.meta({
  title: "Components/Carousel",
  parameters: { figma: {} },
});

const COUNT = 5;

/** Five numbered slides, with the selected slide read back through `setApi`. */
function Slides({ orientation = "horizontal" }: { orientation?: Carousel.Orientation }) {
  const [api, setApi] = useState<Carousel.Api>();
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    const onSelect = (instance: Carousel.Api) => setSelected(instance.selectedScrollSnap());
    if (api) onSelect(api);
    api?.on("select", onSelect);
    return () => {
      api?.off("select", onSelect);
    };
  }, [api]);

  return (
    <div {...stylex.props(styles.frame, orientation === "vertical" && styles.verticalFrame)}>
      <Carousel.Root aria-label="Photos" orientation={orientation} setApi={setApi}>
        <Carousel.Content style={orientation === "vertical" && styles.verticalContent}>
          {Array.from({ length: COUNT }, (_, index) => (
            <Carousel.Item key={index} aria-label={`${index + 1} of ${COUNT}`}>
              <div
                {...stylex.props(styles.slide, orientation === "vertical" && styles.verticalSlide)}
              >
                {index + 1}
              </div>
            </Carousel.Item>
          ))}
        </Carousel.Content>
        <Carousel.Previous />
        <Carousel.Next />
      </Carousel.Root>
      <p aria-live="polite" {...stylex.props(styles.status)}>
        Slide {selected + 1} of {COUNT}
      </p>
    </div>
  );
}

/** Previous and Next move one slide and turn aria-disabled at the first and last slides. */
export const Default = meta.story({
  render: () => <Slides />,
  play: async ({ canvas }) => {
    const previous = canvas.getByRole("button", { name: "Previous slide" });
    const next = canvas.getByRole("button", { name: "Next slide" });

    await expect(canvas.getByRole("region", { name: "Photos" })).toHaveAttribute(
      "aria-roledescription",
      "carousel",
    );
    await expect(canvas.getAllByRole("group")).toHaveLength(COUNT);
    await waitFor(() => expect(next).toHaveAttribute("aria-disabled", "false"));
    await expect(previous).toHaveAttribute("aria-disabled", "true");

    await userEvent.click(next);
    await canvas.findByText("Slide 2 of 5");
    await waitFor(() => expect(previous).toHaveAttribute("aria-disabled", "false"));

    await userEvent.click(previous);
    await canvas.findByText("Slide 1 of 5");

    for (let index = 0; index < COUNT - 1; index++) await userEvent.click(next);
    await canvas.findByText("Slide 5 of 5");
    await waitFor(() => expect(next).toHaveAttribute("aria-disabled", "true"));
  },
});

/** Left and Right arrows move between slides while focus is inside the carousel. */
export const Keyboard = meta.story({
  render: () => <Slides />,
  play: async ({ canvas }) => {
    const previous = canvas.getByRole("button", { name: "Previous slide" });
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "Next slide" })).toHaveAttribute(
        "aria-disabled",
        "false",
      ),
    );

    await userEvent.tab();
    await expect(previous).toHaveFocus();

    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    await canvas.findByText("Slide 3 of 5");

    await userEvent.keyboard("{ArrowLeft}");
    await canvas.findByText("Slide 2 of 5");

    // Focus stays on Previous as it becomes disabled at the first slide.
    await userEvent.keyboard("{ArrowLeft}");
    await canvas.findByText("Slide 1 of 5");
    await expect(previous).toHaveFocus();
  },
});

/** Slides stack and Up and Down arrows move between them; Left and Right do nothing. */
export const Vertical = meta.story({
  render: () => <Slides orientation="vertical" />,
  play: async ({ canvas }) => {
    const next = canvas.getByRole("button", { name: "Next slide" });
    await waitFor(() => expect(next).toHaveAttribute("aria-disabled", "false"));

    await userEvent.click(next);
    await canvas.findByText("Slide 2 of 5");

    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByText("Slide 2 of 5")).toBeInTheDocument();

    await userEvent.keyboard("{ArrowDown}");
    await canvas.findByText("Slide 3 of 5");

    await userEvent.keyboard("{ArrowUp}");
    await canvas.findByText("Slide 2 of 5");
  },
});

const styles = stylex.create({
  frame: {
    marginInline: "3rem",
    width: "16rem",
  },
  verticalFrame: {
    marginBlock: "3rem",
  },
  verticalContent: {
    height: "12rem",
  },
  slide: {
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    alignItems: "center",
    aspectRatio: "1",
    boxSizing: "border-box",
    display: "flex",
    fontSize: "2rem",
    fontWeight: typography.fontWeightSemibold,
    justifyContent: "center",
  },
  verticalSlide: {
    aspectRatio: "auto",
    height: "100%",
  },
  status: {
    color: colors.mutedForeground,
    fontSize: typography.fontSizeSm,
    textAlign: "center",
  },
});
