import type { ReactNode } from "react";

export interface AddressPickerProps {
  children: ReactNode;
  isEmpty: boolean;
  isAdding: boolean;
  onAddClick: () => void;
  form: ReactNode;
}

export function AddressPicker({
  children,
  isEmpty,
  isAdding,
  onAddClick,
  form,
}: AddressPickerProps) {
  return (
    <div className="flex flex-col gap-4">
      {!isEmpty && <div className="flex flex-col gap-4">{children}</div>}
      {isAdding ? (
        form
      ) : (
        <button
          type="button"
          onClick={onAddClick}
          className="w-fit border-b border-ink pb-0.5 text-[13px] hover:border-primary hover:text-primary"
        >
          Add a new address
        </button>
      )}
    </div>
  );
}
