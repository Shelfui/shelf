"use client";

import * as stylex from "@stylexjs/stylex";
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import {
  type ComponentProps,
  type KeyboardEvent,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { spacing } from "../../foundations/tokens.stylex";
import { Button, type ButtonProps } from "../button/button";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon } from "../icons/icons";
import type { Styled } from "../../lib/utils";

/** The Embla instance, for reading the selected slide or scrolling from your own controls. */
export type Api = NonNullable<UseEmblaCarouselType[1]>;
export type Options = Parameters<typeof useEmblaCarousel>[0];
export type Plugins = Parameters<typeof useEmblaCarousel>[1];
export type Orientation = "horizontal" | "vertical";

interface CarouselContextValue {
  viewportRef: UseEmblaCarouselType[0];
  api: Api | undefined;
  orientation: Orientation;
  canScrollPrev: boolean;
  canScrollNext: boolean;
}

const CarouselContext = createContext<CarouselContextValue | null>(null);

/** The carousel's state, for building custom controls such as slide indicators. */
export function useCarousel(): CarouselContextValue {
  const context = useContext(CarouselContext);
  if (!context) throw new Error("useCarousel must be used inside <Carousel.Root>.");
  return context;
}

export type RootProps = Styled<ComponentProps<"div">> & {
  /** Embla options such as `loop`, `align`, or `startIndex`. `axis` follows `orientation`. */
  opts?: Options;
  /** Embla plugins such as autoplay. */
  plugins?: Plugins;
  orientation?: Orientation;
  /** Receives the Embla instance once it is ready. */
  setApi?: (api: Api) => void;
};

/**
 * A slideshow built on Embla. Compose the parts:
 *
 *   <Carousel.Root aria-label="Featured plans">
 *     <Carousel.Content>
 *       <Carousel.Item>…</Carousel.Item>
 *       <Carousel.Item>…</Carousel.Item>
 *     </Carousel.Content>
 *     <Carousel.Previous />
 *     <Carousel.Next />
 *   </Carousel.Root>
 *
 * Name the region with `aria-label`. Arrow keys move between slides while focus is
 * inside the carousel (Left/Right, or Up/Down when vertical). Size slides by passing
 * `flexBasis` to `Item` through `style`; a vertical `Content` needs a height.
 */
export function Root({
  opts,
  plugins,
  orientation = "horizontal",
  setApi,
  style,
  onKeyDownCapture,
  children,
  ...props
}: RootProps) {
  const [viewportRef, api] = useEmblaCarousel(
    { ...opts, axis: orientation === "horizontal" ? "x" : "y" },
    plugins,
  );
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (api) setApi?.(api);
  }, [api, setApi]);

  useEffect(() => {
    const update = (instance: Api) => {
      setCanScrollPrev(instance.canScrollPrev());
      setCanScrollNext(instance.canScrollNext());
    };
    if (api) update(api);
    api?.on("reInit", update).on("select", update);
    return () => {
      api?.off("reInit", update).off("select", update);
    };
  }, [api]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    onKeyDownCapture?.(event);
    if (event.defaultPrevented || isEditable(event.target)) return;
    const [prevKey, nextKey] =
      orientation === "horizontal" ? ["ArrowLeft", "ArrowRight"] : ["ArrowUp", "ArrowDown"];
    if (event.key === prevKey) {
      event.preventDefault();
      api?.scrollPrev();
    } else if (event.key === nextKey) {
      event.preventDefault();
      api?.scrollNext();
    }
  }

  return (
    <CarouselContext.Provider
      value={{ viewportRef, api, orientation, canScrollPrev, canScrollNext }}
    >
      <div
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        data-orientation={orientation}
        {...props}
        onKeyDownCapture={handleKeyDown}
        {...stylex.props(styles.root, style)}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

/** The clipping viewport and the track that holds the slides. */
export function Content({ style, ...props }: Styled<ComponentProps<"div">>) {
  const { viewportRef, orientation } = useCarousel();
  return (
    <div ref={viewportRef} data-slot="carousel-viewport" {...stylex.props(styles.viewport)}>
      <div
        data-slot="carousel-content"
        {...props}
        {...stylex.props(styles.track, trackStyles[orientation], style)}
      />
    </div>
  );
}

/** One slide. Fills the viewport by default; override `flexBasis` to show several. */
export function Item({ style, ...props }: Styled<ComponentProps<"div">>) {
  const { orientation } = useCarousel();
  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      {...props}
      {...stylex.props(styles.item, itemStyles[orientation], style)}
    />
  );
}

/**
 * Scrolls to the previous slide. Sits outside the start edge; move it with `style`.
 * Stays focusable at the first slide so keyboard focus is not lost.
 */
export function Previous({
  variant = "outline",
  size = "icon-sm",
  style,
  onClick,
  ...props
}: ButtonProps) {
  const { api, orientation, canScrollPrev } = useCarousel();
  return (
    <Button
      data-slot="carousel-previous"
      aria-label="Previous slide"
      variant={variant}
      size={size}
      disabled={!canScrollPrev}
      focusableWhenDisabled
      {...props}
      onClick={(event) => {
        onClick?.(event);
        api?.scrollPrev();
      }}
      style={[styles.control, previousStyles[orientation], style]}
    >
      {orientation === "horizontal" ? <ChevronLeftIcon /> : <ChevronUpIcon />}
    </Button>
  );
}

/**
 * Scrolls to the next slide. Sits outside the end edge; move it with `style`.
 * Stays focusable at the last slide so keyboard focus is not lost.
 */
export function Next({
  variant = "outline",
  size = "icon-sm",
  style,
  onClick,
  ...props
}: ButtonProps) {
  const { api, orientation, canScrollNext } = useCarousel();
  return (
    <Button
      data-slot="carousel-next"
      aria-label="Next slide"
      variant={variant}
      size={size}
      disabled={!canScrollNext}
      focusableWhenDisabled
      {...props}
      onClick={(event) => {
        onClick?.(event);
        api?.scrollNext();
      }}
      style={[styles.control, nextStyles[orientation], style]}
    >
      {orientation === "horizontal" ? <ChevronRightIcon /> : <ChevronDownIcon />}
    </Button>
  );
}

function isEditable(target: EventTarget) {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

const styles = stylex.create({
  root: {
    position: "relative",
  },
  viewport: {
    overflow: "hidden",
  },
  track: {
    display: "flex",
  },
  item: {
    boxSizing: "border-box",
    flexBasis: "100%",
    flexGrow: 0,
    flexShrink: 0,
    minHeight: 0,
    minWidth: 0,
  },
  control: {
    position: "absolute",
  },
});

// The track's negative margin and each item's padding make an even gap between slides.
const trackStyles = stylex.create({
  horizontal: {
    marginInlineStart: `calc(-1 * ${spacing["4"]})`,
  },
  vertical: {
    flexDirection: "column",
    marginTop: `calc(-1 * ${spacing["4"]})`,
  },
});

const itemStyles = stylex.create({
  horizontal: {
    paddingInlineStart: spacing["4"],
  },
  vertical: {
    paddingTop: spacing["4"],
  },
});

const previousStyles = stylex.create({
  horizontal: {
    insetInlineStart: "-3rem",
    transform: "translateY(-50%)",
    top: "50%",
  },
  vertical: {
    transform: "translateX(-50%)",
    left: "50%",
    top: "-3rem",
  },
});

const nextStyles = stylex.create({
  horizontal: {
    insetInlineEnd: "-3rem",
    transform: "translateY(-50%)",
    top: "50%",
  },
  vertical: {
    transform: "translateX(-50%)",
    bottom: "-3rem",
    left: "50%",
  },
});
