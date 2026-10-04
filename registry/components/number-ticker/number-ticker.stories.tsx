import { useState } from "react";
import { expect, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import { Button } from "../button/button";
import { NumberTicker } from "./number-ticker";

const meta = preview.meta({ title: "Components/Number Ticker" });

function Counter() {
  const [value, setValue] = useState(1200);
  return (
    <div>
      <p>
        <NumberTicker
          value={value}
          format={{ style: "currency", currency: "USD" }}
          locale="en-US"
        />
      </p>
      <Button onClick={() => setValue(4800)}>Update</Button>
    </div>
  );
}

/** The visible number counts up; the text read out is always the final value. */
export const Default = meta.story({
  render: () => <Counter />,
  play: async ({ canvas }) => {
    await expect(canvas.getAllByText("$1,200.00")).toHaveLength(2);
    await userEvent.click(canvas.getByRole("button", { name: "Update" }));
    await waitFor(() => expect(canvas.getAllByText("$4,800.00")).toHaveLength(2), {
      timeout: 3000,
    });
  },
});
