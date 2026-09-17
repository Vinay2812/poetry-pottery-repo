export interface PackingSlipLine {
  id: number;
  name: string;
  selectionLabels: string[];
  quantity: number;
  unitPriceLabel: string;
  lineTotalLabel: string;
}

export interface PackingSlipProps {
  orderId: string;
  placedLabel: string;
  studioName: string;
  addressLines: string[];
  lines: PackingSlipLine[];
  /** Everything about money is dropped when the buyer asked for a gift slip. */
  isPricesHidden: boolean;
  subtotalLabel: string;
  discountLabel: string | null;
  shippingLabel: string;
  totalLabel: string;
  giftNote: string | null;
  customerNote: string | null;
  careNotes: string[];
}

const CELL = "border-b border-ash py-2 text-left align-top text-[13px]";

export function PackingSlip({
  orderId,
  placedLabel,
  studioName,
  addressLines,
  lines,
  isPricesHidden,
  subtotalLabel,
  discountLabel,
  shippingLabel,
  totalLabel,
  giftNote,
  customerNote,
  careNotes,
}: PackingSlipProps) {
  return (
    <article className="mx-auto flex max-w-[46rem] flex-col gap-8 bg-white p-8 text-foreground print:max-w-none print:p-0">
      <header className="flex flex-wrap items-baseline justify-between gap-4 border-b border-ash pb-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[20px] tracking-[0.02em]">{studioName}</h1>
          <p className="text-[12px] text-muted-foreground">Packing slip</p>
        </div>
        <div className="flex flex-col gap-1 text-right">
          <p className="text-[13px] tnum">{orderId}</p>
          <p className="text-[12px] text-muted-foreground">{placedLabel}</p>
        </div>
      </header>

      <section className="flex flex-col gap-1.5">
        <h2 className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
          Ship to
        </h2>
        {addressLines.map((line) => (
          <p key={line} className="text-[13px]">
            {line}
          </p>
        ))}
      </section>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th
              className={`${CELL} text-[11px] tracking-[0.14em] text-muted-foreground uppercase`}
            >
              Piece
            </th>
            <th
              className={`${CELL} w-16 text-right text-[11px] tracking-[0.14em] text-muted-foreground uppercase`}
            >
              Qty
            </th>
            {!isPricesHidden && (
              <>
                <th
                  className={`${CELL} w-24 text-right text-[11px] tracking-[0.14em] text-muted-foreground uppercase`}
                >
                  Unit
                </th>
                <th
                  className={`${CELL} w-24 text-right text-[11px] tracking-[0.14em] text-muted-foreground uppercase`}
                >
                  Line
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.id}>
              <td className={CELL}>
                {line.name}
                {line.selectionLabels.map((label) => (
                  <span
                    key={label}
                    className="block text-[11px] text-muted-foreground"
                  >
                    {label}
                  </span>
                ))}
              </td>
              <td className={`${CELL} text-right tnum`}>{line.quantity}</td>
              {!isPricesHidden && (
                <>
                  <td className={`${CELL} text-right tnum`}>
                    {line.unitPriceLabel}
                  </td>
                  <td className={`${CELL} text-right tnum`}>
                    {line.lineTotalLabel}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {!isPricesHidden && (
        <dl className="ml-auto flex w-56 flex-col gap-1.5 text-[13px]">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="tnum">{subtotalLabel}</dd>
          </div>
          {discountLabel !== null && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Discount</dt>
              <dd className="tnum">−{discountLabel}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd className="tnum">{shippingLabel}</dd>
          </div>
          <div className="flex justify-between border-t border-ash pt-1.5">
            <dt>Total</dt>
            <dd className="tnum">{totalLabel}</dd>
          </div>
        </dl>
      )}

      {giftNote !== null && (
        <section className="flex flex-col gap-1.5 border-t border-ash pt-4">
          <h2 className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
            Gift note
          </h2>
          <p className="text-[13px] whitespace-pre-line">{giftNote}</p>
        </section>
      )}

      {customerNote !== null && (
        <section className="flex flex-col gap-1.5 border-t border-ash pt-4">
          <h2 className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
            What they asked for
          </h2>
          <p className="text-[13px] whitespace-pre-line">{customerNote}</p>
        </section>
      )}

      {careNotes.length > 0 && (
        <section className="flex flex-col gap-1.5 border-t border-ash pt-4">
          <h2 className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
            Care
          </h2>
          <ul className="flex flex-col gap-1">
            {careNotes.map((note) => (
              <li key={note} className="text-[13px]">
                {note}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
