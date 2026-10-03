import { type ReactNode, act, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

// Tells React to expect act() calls, as in a test environment.
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

export interface RenderCount {
  /** Re-renders the parent once. `wrap` receives the new tick. */
  rerender: () => Promise<void>;
  /** How many times the consumer rendered since mount settled or the last `rerender`. */
  renders: () => number;
  unmount: () => void;
}

/**
 * Measures whether a context consumer re-renders when the component that provides the context does.
 *
 * `wrap` renders the provider under test around `children` and is called again on every
 * `rerender()`. `useContextValue` is the provider's own hook (`useSidebar`, say); a probe that
 * calls it is the only child. The probe is created once, outside the parent, so React skips it
 * unless the context value changed. Ignore `tick` in `wrap` to prove a plain parent re-render
 * costs nothing, or make a prop depend on it to prove a real change still reaches the consumer.
 */
export async function renderCount(
  wrap: (children: ReactNode, tick: number) => ReactNode,
  useContextValue: () => unknown,
): Promise<RenderCount> {
  const counter = { renders: 0, bump: undefined as (() => void) | undefined };

  function Probe() {
    useContextValue();
    // An effect without dependencies runs after every render of the probe.
    useEffect(() => {
      counter.renders++;
    });
    return null;
  }
  const probe = <Probe />;

  function Parent() {
    const [tick, setTick] = useState(0);
    useEffect(() => {
      counter.bump = () => setTick((current) => current + 1);
    }, []);
    return wrap(probe, tick);
  }

  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  await act(async () => root.render(<Parent />));
  // Effects such as an Embla instance becoming ready cause updates of their own.
  await act(async () => {});
  counter.renders = 0;

  return {
    rerender: async () => {
      counter.renders = 0;
      await act(async () => counter.bump?.());
    },
    renders: () => counter.renders,
    unmount: () => {
      act(() => root.unmount());
      container.remove();
    },
  };
}
