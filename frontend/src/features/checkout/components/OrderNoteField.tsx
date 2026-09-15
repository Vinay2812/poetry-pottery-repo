import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface OrderNoteFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function OrderNoteField({ value, onChange }: OrderNoteFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="order-note">Anything we should know? (optional)</Label>
      <Textarea
        id="order-note"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={500}
        rows={3}
        placeholder="Gift wrapping, a delivery window, a note for the card…"
        className="rounded-xl"
      />
      <p className="text-right text-xs text-muted-foreground">
        {value.length}/500
      </p>
    </div>
  );
}
