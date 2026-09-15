import { Check, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toAddressLines } from "@/features/addresses/types";
import { cn } from "@/lib/utils";

export interface AddressCardProps {
  name: string;
  phone: string;
  line1: string;
  line2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  isSelected: boolean;
  isSelectable: boolean;
  onSelect?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMakeDefault: () => void;
}

export function AddressCard({
  name,
  phone,
  line1,
  line2,
  landmark,
  city,
  state,
  pincode,
  isDefault,
  isSelected,
  isSelectable,
  onSelect,
  onEdit,
  onDelete,
  onMakeDefault,
}: AddressCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl bg-cream p-4 md:p-5",
        isSelected && "ring-2 ring-primary",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium md:text-base">{name}</p>
          <p className="mt-1 text-sm text-clay-dark">
            {toAddressLines(line1, line2, landmark, city, state, pincode)}
          </p>
          <p className="mt-1 text-sm text-clay-dark">{phone}</p>
        </div>
        {isDefault && (
          <span className="shrink-0 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
            Default
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        {isSelectable &&
          (isSelected ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Check className="size-4" />
              Delivering here
            </span>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={onSelect}
            >
              Deliver here
            </Button>
          ))}
        <button
          type="button"
          onClick={onEdit}
          className="text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          Edit
        </button>
        {!isDefault && (
          <button
            type="button"
            onClick={onMakeDefault}
            className="text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            Make default
          </button>
        )}
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Remove the address for ${name}`}
          className="ml-auto flex size-8 items-center justify-center rounded-full text-terracotta-dark hover:bg-terracotta-light"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  );
}
