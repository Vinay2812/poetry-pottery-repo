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

const TEXT_LINK =
  "text-[13px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline";

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
        "flex flex-col gap-3 border p-4 transition-colors duration-200 md:p-5",
        isSelected ? "border-ink" : "border-ash",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[15px]">{name}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {toAddressLines(line1, line2, landmark, city, state, pincode)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground tnum">{phone}</p>
        </div>
        {isDefault && (
          <span className="shrink-0 text-[13px] text-muted-foreground">
            Default
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        {isSelectable &&
          (isSelected ? (
            <span className="text-[13px]">Delivering here</span>
          ) : (
            <Button variant="outline" size="sm" onClick={onSelect}>
              Deliver here
            </Button>
          ))}
        <button type="button" onClick={onEdit} className={TEXT_LINK}>
          Edit
        </button>
        {!isDefault && (
          <button type="button" onClick={onMakeDefault} className={TEXT_LINK}>
            Make default
          </button>
        )}
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Remove the address for ${name}`}
          className={TEXT_LINK}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
