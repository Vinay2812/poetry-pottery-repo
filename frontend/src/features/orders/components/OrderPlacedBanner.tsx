import { MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { toPotteryIconKind } from "@/components/icons/pottery";
import { PlaceholderImage } from "@/components/media/PlaceholderImage";
import { Button } from "@/components/ui/button";

export interface OrderPlacedBannerProps {
  firstName: string;
  pieces: { id: number; name: string; imageUrl: string | null }[];
  arrivalLine: string;
  transitLine: string;
  emailedTo: string | null;
  whatsappUrl: string | null;
}

export function OrderPlacedBanner({
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
          We confirm every order by hand, so send us a message or wait for ours
          within a day.
        </p>
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

      <div className="flex flex-col gap-1 border-t border-ash pt-5">
        <p className="text-[15px]">{arrivalLine}</p>
        <p className="text-[13px] text-muted-foreground">{transitLine}</p>
        {emailedTo && (
          <p className="text-[13px] text-muted-foreground">
            We have emailed a copy to {emailedTo}.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-5">
        {whatsappUrl && (
          <Button size="lg" asChild>
            <a href={whatsappUrl} target="_blank" rel="noreferrer">
              <MessageCircle className="size-4" strokeWidth={1.5} />
              Confirm on WhatsApp
            </a>
          </Button>
        )}
        <Link
          href="/care"
          className="border-b border-ink pb-0.5 text-sm hover:border-primary hover:text-primary"
        >
          How to care for these pieces
        </Link>
      </div>
    </section>
  );
}
