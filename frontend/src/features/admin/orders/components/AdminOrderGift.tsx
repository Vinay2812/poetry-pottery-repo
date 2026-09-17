export interface AdminOrderGiftProps {
  giftNote: string | null;
  isPricesHidden: boolean;
}

/** Both facts change what goes in the box, so they sit together above the packing slip. */
export function AdminOrderGift({
  giftNote,
  isPricesHidden,
}: AdminOrderGiftProps) {
  if (giftNote === null && !isPricesHidden) {
    return (
      <p className="text-[13px] text-muted-foreground">
        Not a gift. Pack it with the prices on.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {isPricesHidden && (
        <p className="border-l-2 border-primary pl-3 text-[13px]">
          Leave the prices off the slip.
        </p>
      )}
      {giftNote !== null && (
        <div className="flex flex-col gap-1.5">
          <p className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
            Gift note to write out
          </p>
          <p className="text-[13px] whitespace-pre-line">{giftNote}</p>
        </div>
      )}
    </div>
  );
}
