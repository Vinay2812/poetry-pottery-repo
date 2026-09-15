import type { ReactNode } from "react";
import { Plus } from "lucide-react";

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
    <div className="flex flex-col gap-3">
      {!isEmpty && <div className="flex flex-col gap-3">{children}</div>}
      {isAdding ? (
        form
      ) : (
        <button
          type="button"
          onClick={onAddClick}
          className="flex items-center gap-2 rounded-2xl border border-dashed border-clay/40 px-4 py-4 text-sm font-medium text-primary hover:bg-primary-light"
        >
          <Plus className="size-4" />
          Add a new address
        </button>
      )}
    </div>
  );
}
