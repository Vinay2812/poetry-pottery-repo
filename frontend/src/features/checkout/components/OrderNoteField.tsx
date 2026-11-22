import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { ORDER_NOTE_MAX_LENGTH } from "@/features/checkout/types";

export interface OrderNoteFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function OrderNoteField({ value, onChange }: OrderNoteFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="order-note" className="text-[13px] text-muted-foreground">
        Anything we should know? (optional)
      </Label>
      <Textarea
        id="order-note"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={ORDER_NOTE_MAX_LENGTH}
        rows={3}
        placeholder="A good time to deliver, or anything about the order"
      />
      <p className="text-right text-[13px] text-muted-foreground tnum">
        {value.length}/{ORDER_NOTE_MAX_LENGTH}
      </p>
    </div>
  );
}
