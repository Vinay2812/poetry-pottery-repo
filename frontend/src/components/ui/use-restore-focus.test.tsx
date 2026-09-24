import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";

type AutoFocusHandler = (event: Event) => void;

interface HarnessProps {
  kind: "dialog" | "sheet";
  onOpenAutoFocus?: AutoFocusHandler;
  onCloseAutoFocus?: AutoFocusHandler;
}

// Opened from a plain button, never a Radix Trigger, the way our containers open them.
function Harness({ kind, onOpenAutoFocus, onCloseAutoFocus }: HarnessProps) {
  const [isOpen, setIsOpen] = useState(false);
  const body = (
    <button type="button" onClick={() => setIsOpen(false)}>
      Done
    </button>
  );
  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        Open
      </button>
      <button type="button">Elsewhere</button>
      {kind === "dialog" ? (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent
            onOpenAutoFocus={onOpenAutoFocus}
            onCloseAutoFocus={onCloseAutoFocus}
          >
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
            {body}
          </DialogContent>
        </Dialog>
      ) : (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent
            onOpenAutoFocus={onOpenAutoFocus}
            onCloseAutoFocus={onCloseAutoFocus}
          >
            <SheetTitle>Title</SheetTitle>
            <SheetDescription>Description</SheetDescription>
            {body}
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}

async function openAndClose() {
  const opener = screen.getByRole("button", { name: "Open" });
  opener.focus();
  fireEvent.click(opener);
  const done = await screen.findByRole("button", { name: "Done" });
  await waitFor(() => expect(opener).not.toHaveFocus());
  fireEvent.click(done);
  await waitFor(() =>
    expect(screen.queryByRole("button", { name: "Done" })).toBeNull(),
  );
  return opener;
}

describe.each(["dialog", "sheet"] as const)(
  "%s content without a trigger",
  (kind) => {
    it("hands focus back to whatever opened it", async () => {
      render(<Harness kind={kind} />);
      const opener = await openAndClose();
      await waitFor(() => expect(opener).toHaveFocus());
    });

    it("still runs the caller's handlers", async () => {
      const onOpen = vi.fn<AutoFocusHandler>();
      const onClose = vi.fn<AutoFocusHandler>();
      render(
        <Harness
          kind={kind}
          onOpenAutoFocus={onOpen}
          onCloseAutoFocus={onClose}
        />,
      );
      const opener = await openAndClose();
      await waitFor(() => expect(opener).toHaveFocus());
      expect(onOpen).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("leaves focus to a caller that prevents the default", async () => {
      render(
        <Harness
          kind={kind}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            screen.getByRole("button", { name: "Elsewhere" }).focus();
          }}
        />,
      );
      await openAndClose();
      await waitFor(() =>
        expect(screen.getByRole("button", { name: "Elsewhere" })).toHaveFocus(),
      );
    });
  },
);
