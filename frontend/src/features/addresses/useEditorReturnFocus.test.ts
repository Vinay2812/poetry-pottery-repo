import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useEditorReturnFocus } from "./useEditorReturnFocus";

function button(label: string): HTMLButtonElement {
  const node = document.createElement("button");
  node.textContent = label;
  document.body.append(node);
  return node;
}

function renderFocus() {
  const openEdit = vi.fn<(id: number) => void>();
  const openNew = vi.fn<() => void>();
  const view = renderHook(
    ({ isFormOpen }: { isFormOpen: boolean }) =>
      useEditorReturnFocus(isFormOpen, openEdit, openNew),
    { initialProps: { isFormOpen: false } },
  );
  return { ...view, openEdit, openNew };
}

describe("useEditorReturnFocus", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("hands focus back to the Edit button of the address that was edited", () => {
    const { result, rerender, openEdit } = renderFocus();
    const edit = button("Edit");
    act(() => result.current.toEditButtonRef(7)(edit));

    act(() => result.current.handleEdit(7));
    expect(openEdit).toHaveBeenCalledWith(7);
    rerender({ isFormOpen: true });
    rerender({ isFormOpen: false });

    expect(document.activeElement).toBe(edit);
  });

  it("hands focus back to Add a new address when a new address is cancelled", () => {
    const { result, rerender, openNew } = renderFocus();
    const add = button("Add a new address");
    result.current.addButtonRef.current = add;

    act(() => result.current.handleAddNew());
    expect(openNew).toHaveBeenCalled();
    rerender({ isFormOpen: true });
    rerender({ isFormOpen: false });

    expect(document.activeElement).toBe(add);
  });

  it("leaves focus alone when no editor was opened from here", () => {
    const { rerender } = renderFocus();
    const other = button("Elsewhere");
    other.focus();

    rerender({ isFormOpen: true });
    rerender({ isFormOpen: false });

    expect(document.activeElement).toBe(other);
  });
});
