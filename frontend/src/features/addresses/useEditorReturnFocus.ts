"use client";

import { type RefObject, useCallback, useEffect, useRef } from "react";

const NEW_ADDRESS = "new";

export interface EditorReturnFocus {
  addButtonRef: RefObject<HTMLButtonElement | null>;
  toEditButtonRef: (id: number) => (node: HTMLButtonElement | null) => void;
  handleEdit: (id: number) => void;
  handleAddNew: () => void;
}

// The editor takes the place of what opened it, so closing it hands focus back to that Edit or "Add a new address".
export function useEditorReturnFocus(
  isFormOpen: boolean,
  openEdit: (id: number) => void,
  openNew: () => void,
): EditorReturnFocus {
  const editButtons = useRef(new Map<number, HTMLButtonElement>());
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const returnTo = useRef<number | typeof NEW_ADDRESS | null>(null);

  const handleEdit = useCallback(
    (id: number) => {
      returnTo.current = id;
      openEdit(id);
    },
    [openEdit],
  );

  const handleAddNew = useCallback(() => {
    returnTo.current = NEW_ADDRESS;
    openNew();
  }, [openNew]);

  useEffect(() => {
    if (isFormOpen || returnTo.current === null) return;
    const target =
      returnTo.current === NEW_ADDRESS
        ? addButtonRef.current
        : editButtons.current.get(returnTo.current);
    target?.focus();
    returnTo.current = null;
  }, [isFormOpen]);

  const toEditButtonRef = useCallback(
    (id: number) => (node: HTMLButtonElement | null) => {
      if (node) editButtons.current.set(id, node);
      else editButtons.current.delete(id);
    },
    [],
  );

  return { addButtonRef, toEditButtonRef, handleEdit, handleAddNew };
}
