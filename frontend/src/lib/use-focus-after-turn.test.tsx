import { act, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { useFocusAfterTurn } from "./use-focus-after-turn";

interface ListProps {
  isSettled: boolean;
  shownPage: number;
  failedPage: number | null;
  onReady: (startTurn: () => void) => void;
}

function List({ isSettled, shownPage, failedPage, onReady }: ListProps) {
  const { headingRef, startTurn } = useFocusAfterTurn<HTMLHeadingElement>(
    isSettled,
    shownPage,
    failedPage,
  );
  onReady(startTurn);
  return (
    <>
      <h1 ref={headingRef} tabIndex={-1}>
        Your orders
      </h1>
      <button type="button">Next</button>
    </>
  );
}

function setup() {
  let startTurn = () => {};
  const onReady = (next: () => void) => {
    startTurn = next;
  };
  const view = render(
    <List isSettled shownPage={1} failedPage={null} onReady={onReady} />,
  );
  screen.getByRole("button", { name: "Next" }).focus();
  const rerender = (
    isSettled: boolean,
    shownPage: number,
    failedPage: number | null,
  ) =>
    view.rerender(
      <List
        isSettled={isSettled}
        shownPage={shownPage}
        failedPage={failedPage}
        onReady={onReady}
      />,
    );
  return { startTurn: () => act(() => startTurn()), rerender };
}

describe("useFocusAfterTurn", () => {
  // jsdom does not lay pages out, so it has no scrollIntoView.
  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("focuses the heading once the next page lands", () => {
    const { startTurn, rerender } = setup();
    startTurn();
    rerender(false, 2, null);
    expect(screen.getByRole("heading")).not.toHaveFocus();
    rerender(true, 2, null);
    expect(screen.getByRole("heading")).toHaveFocus();
  });

  it("focuses the heading when the page comes straight from the cache", () => {
    const { startTurn, rerender } = setup();
    startTurn();
    rerender(true, 2, null);
    expect(screen.getByRole("heading")).toHaveFocus();
  });

  it("leaves focus alone when the page fails", () => {
    const { startTurn, rerender } = setup();
    startTurn();
    rerender(false, 2, null);
    rerender(true, 1, 2);
    expect(screen.getByRole("button", { name: "Next" })).toHaveFocus();
  });

  it("brings focus to the heading when a failed turn left it nowhere", () => {
    const { startTurn, rerender } = setup();
    startTurn();
    // The pager button is disabled while the next page loads, which drops its focus.
    screen.getByRole("button", { name: "Next" }).blur();
    rerender(false, 2, null);
    rerender(true, 1, 2);
    expect(screen.getByRole("heading")).toHaveFocus();
  });

  it("does not move focus on renders that were not a turn", () => {
    const { rerender } = setup();
    rerender(false, 1, null);
    rerender(true, 1, null);
    expect(screen.getByRole("button", { name: "Next" })).toHaveFocus();
  });
});
