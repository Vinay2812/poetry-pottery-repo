import Link from "next/link";

import {
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
} from "@/components/icons/social";

import { Wordmark } from "@/features/layout/components/Wordmark";
import type { NavLink } from "@/features/layout/types";

export interface SiteFooterProps {
  shopLinks: NavLink[];
  studioLinks: NavLink[];
  helpLinks: NavLink[];
  address: string;
  openingHours: string;
  contactEmail: string;
  contactPhone: string;
  whatsappUrl: string | null;
  instagramUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  year: number;
  newsletter?: React.ReactNode;
}

function LinkColumn({ title, links }: { title: string; links: NavLink[] }) {
  return (
    <div className="border-t border-ash pt-5 md:border-t-0 md:border-l md:pt-0 md:pl-6">
      <h3 className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
        {title}
      </h3>
      <ul className="mt-4 flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-[13px] text-foreground underline-offset-4 hover:underline"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter({
  shopLinks,
  studioLinks,
  helpLinks,
  address,
  openingHours,
  contactEmail,
  contactPhone,
  whatsappUrl,
  instagramUrl,
  facebookUrl,
  youtubeUrl,
  year,
  newsletter,
}: SiteFooterProps) {
  const socials = [
    { href: instagramUrl, label: "Instagram", Icon: InstagramIcon },
    { href: facebookUrl, label: "Facebook", Icon: FacebookIcon },
    { href: youtubeUrl, label: "YouTube", Icon: YoutubeIcon },
  ].filter((social) => social.href.length > 0);

  return (
    <footer className="mt-20 border-t border-ash bg-background pb-20 lg:pb-0">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-4">
            <Wordmark />
            <address className="text-[13px] leading-relaxed text-muted-foreground not-italic">
              {address}
              <br />
              {openingHours}
            </address>
            <div className="flex flex-col gap-1 text-[13px]">
              <a
                href={`mailto:${contactEmail}`}
                className="underline-offset-4 hover:underline"
              >
                {contactEmail}
              </a>
              <a
                href={`tel:${contactPhone}`}
                className="underline-offset-4 hover:underline"
              >
                {contactPhone}
              </a>
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Message us on WhatsApp
                </a>
              )}
            </div>
            {socials.length > 0 && (
              <div className="flex gap-2">
                {socials.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="flex size-9 items-center justify-center border border-ash text-foreground transition-colors hover:border-ink"
                  >
                    <Icon className="size-4" />
                  </a>
                ))}
              </div>
            )}
          </div>
          <LinkColumn title="Shop" links={shopLinks} />
          <LinkColumn title="Studio" links={studioLinks} />
          <LinkColumn title="Help" links={helpLinks} />
        </div>

        {newsletter && (
          <div className="mt-12 border-t border-ash pt-8">{newsletter}</div>
        )}

        <p className="mt-12 border-t border-ash pt-6 text-[13px] text-muted-foreground">
          © {year} Poetry &amp; Pottery, Sangli.
        </p>
      </div>
    </footer>
  );
}
