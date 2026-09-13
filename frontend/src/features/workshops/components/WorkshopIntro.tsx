import Image from "next/image";
import Link from "next/link";

import { PlaceholderImage } from "@/components/media/PlaceholderImage";
import { formatInr } from "@/lib/format";

import { formatHours, type WorkshopTierData } from "@/features/workshops/types";

export interface WorkshopIntroProps {
  name: string;
  description: string | null;
  imageUrl: string | null;
  tiers: WorkshopTierData[];
  href: string | null;
}

export function WorkshopIntro({
  name,
  description,
  imageUrl,
  tiers,
  href,
}: WorkshopIntroProps) {
  return (
    <section className="flex flex-col gap-6">
      <div className="relative aspect-4/3 overflow-hidden bg-white md:aspect-21/9">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            priority
            sizes="(min-width: 1280px) 1280px, 100vw"
            className="object-cover"
          />
        ) : (
          <PlaceholderImage kind="vase" />
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h1 className="max-w-3xl font-heading text-3xl leading-tight tracking-tight text-balance md:text-5xl">
          {name}
        </h1>
        {description && (
          <p className="max-w-xl text-[15px] text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      <table className="w-full max-w-xl text-sm">
        <thead>
          <tr className="border-b border-ash text-left text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
            <th scope="col" className="py-2 font-normal">
              Hours
            </th>
            <th scope="col" className="py-2 font-normal">
              Per person
            </th>
            <th scope="col" className="py-2 font-normal">
              You take home
            </th>
          </tr>
        </thead>
        <tbody>
          {tiers.map((tier) => (
            <tr key={tier.hours} className="border-b border-ash">
              <td className="py-3 tnum">{formatHours(tier.hours)}</td>
              <td className="py-3 tnum">{formatInr(tier.price_per_person)}</td>
              <td className="py-3">
                {tier.pieces_per_person === 1
                  ? "1 piece"
                  : `${tier.pieces_per_person} pieces`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {href && (
        <Link
          href={href}
          className="w-fit border-b border-ink pb-0.5 text-[13px] hover:border-primary hover:text-primary"
        >
          Pick a day
        </Link>
      )}
    </section>
  );
}
