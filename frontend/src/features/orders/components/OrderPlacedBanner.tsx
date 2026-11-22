import { MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { toPotteryIconKind } from "@/components/icons/pottery";
import { PlaceholderImage } from "@/components/media/PlaceholderImage";
import { Button } from "@/components/ui/button";
import { WhatsAppLink } from "@/components/whatsapp/WhatsAppLink";

import { OrderNextStep } from "@/features/orders/components/OrderNextStep";

export interface OrderPlacedBannerProps {
  orderId: string;
  firstName: string;
  pieces: { id: number; name: string; imageUrl: string | null }[];
  arrivalLine: string;
  transitLine: string;
  emailedTo: string | null;
  whatsappUrl: string | null;
}

export function OrderPlacedBanner({
  orderId,
  firstName,
  pieces,
  arrivalLine,
  transitLine,
  emailedTo,
  whatsappUrl,
}: OrderPlacedBannerProps) {
  return (
    <section className="flex flex-col gap-6 border border-ash bg-clay-white p-6 md:p-8">
      <div className="flex flex-col gap-3">
        <h1 className="font-heading text-3xl tracking-tight md:text-4xl">
          Thank you, {firstName}. Your order is in.
        </h1>
        <p className="max-w-xl text-[15px] text-muted-foreground">
          We confirm every order by hand, and there is nothing to pay until we
          do.
        </p>
        {emailedTo && (
          <p className="text-[13px] text-muted-foreground">
            We have emailed a copy to {emailedTo}.
          </p>
        )}
      </div>

      <ul className="flex flex-wrap gap-3">
        {pieces.map((piece) => (
          <li key={piece.id} className="flex w-20 flex-col gap-1.5">
            <span className="relative aspect-square w-full overflow-hidden bg-white">
              {piece.imageUrl ? (
                <Image
                  src={piece.imageUrl}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : (
                <PlaceholderImage kind={toPotteryIconKind(piece.name)} />
              )}
            </span>
            <span className="line-clamp-2 text-[13px] text-muted-foreground">
              {piece.name}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-4 border-t border-ash pt-5">
        <h2 className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
          What happens next
        </h2>
        <ol className="flex max-w-xl flex-col gap-5">
          <OrderNextStep
            number={1}
            title="We confirm on WhatsApp"
            line={
              whatsappUrl
                ? "Within a day. Message us first if you would rather not wait."
                : "Within a day."
            }
            action={
              whatsappUrl ? (
                <Button asChild>
                  <WhatsAppLink
                    href={whatsappUrl}
                    kind="order"
                    reference={orderId}
                  >
                    <MessageCircle className="size-4" strokeWidth={1.5} />
                    Message us on WhatsApp
                  </WhatsAppLink>
                </Button>
              ) : null
            }
          />
          <OrderNextStep
            number={2}
            title="You pay by UPI"
            line="The UPI details come with our confirmation."
          />
        </ol>
      </div>

      <div className="flex flex-col gap-1 border-t border-ash pt-5">
        <p className="text-[15px]">{arrivalLine}</p>
        <p className="text-[13px] text-muted-foreground">{transitLine}</p>
        <Link
          href="/care"
          className="mt-3 w-fit border-b border-ink pb-0.5 text-sm hover:border-primary hover:text-primary"
        >
          How to care for these pieces
        </Link>
      </div>
    </section>
  );
}
