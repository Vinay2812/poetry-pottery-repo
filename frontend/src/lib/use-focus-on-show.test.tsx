import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useFocusOnShow } from "./use-focus-on-show";

function Confirmation({ isShown }: { isShown: boolean }) {
  const ref = useFocusOnShow<HTMLDivElement>(isShown);
  return (
    <div ref={ref} tabIndex={-1} data-testid="panel">
      {isShown ? "Sent" : "Form"}
    </div>
  );
}

describe("useFocusOnShow", () => {
  it("leaves focus alone while hidden", () => {
    render(<Confirmation isShown={false} />);
    expect(screen.getByTestId("panel")).not.toHaveFocus();
  });

  it("focuses the element once it is shown", () => {
    const { rerender } = render(<Confirmation isShown={false} />);
    rerender(<Confirmation isShown />);
    expect(screen.getByTestId("panel")).toHaveFocus();
  });

  it("does not take focus back on later renders", () => {
    const { rerender } = render(
      <>
        <Confirmation isShown />
        <button type="button">Elsewhere</button>
      </>,
    );
    screen.getByRole("button", { name: "Elsewhere" }).focus();
    rerender(
      <>
        <Confirmation isShown />
        <button type="button">Elsewhere</button>
      </>,
    );
    expect(screen.getByRole("button", { name: "Elsewhere" })).toHaveFocus();
  });
});
