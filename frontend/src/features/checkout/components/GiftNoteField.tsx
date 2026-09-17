import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { GIFT_NOTE_MAX_LENGTH } from "@/features/checkout/types";

export interface GiftNoteFieldProps {
  isGift: boolean;
  note: string;
  hasHiddenPrices: boolean;
  onIsGiftChange: (value: boolean) => void;
  onNoteChange: (value: string) => void;
  onHiddenPricesChange: (value: boolean) => void;
}

export function GiftNoteField({
  isGift,
  note,
  hasHiddenPrices,
  onIsGiftChange,
  onNoteChange,
  onHiddenPricesChange,
}: GiftNoteFieldProps) {
  return (
    <div className="flex flex-col gap-4 border-t border-ash pt-5">
      <div className="flex items-center gap-3">
        <Checkbox
          id="gift-toggle"
          checked={isGift}
          onCheckedChange={(checked) => onIsGiftChange(checked === true)}
        />
        <Label htmlFor="gift-toggle" className="text-[15px]">
          This is a gift
        </Label>
      </div>

      {isGift && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="gift-note"
              className="text-[13px] text-muted-foreground"
            >
              We write this on a card by hand
            </Label>
            <Textarea
              id="gift-note"
              value={note}
              onChange={(event) => onNoteChange(event.target.value)}
              maxLength={GIFT_NOTE_MAX_LENGTH}
              rows={3}
              placeholder="Happy birthday, Ma. Tea tastes better in this one."
            />
            <p className="text-right text-[13px] text-muted-foreground tnum">
              {note.length}/{GIFT_NOTE_MAX_LENGTH}
            </p>
          </div>
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="gift-hide-prices" className="text-[15px]">
              Leave prices off the packing slip
            </Label>
            <Switch
              id="gift-hide-prices"
              checked={hasHiddenPrices}
              onCheckedChange={onHiddenPricesChange}
            />
          </div>
          <p className="text-[13px] text-muted-foreground">
            The card and the blank slip cost nothing.
          </p>
        </div>
      )}
    </div>
  );
}
