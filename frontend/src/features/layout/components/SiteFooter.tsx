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
    <div>
      <h3 className="text-xs font-semibold tracking-[0.12em] text-clay-dark uppercase">
        {title}
      </h3>
      <ul className="mt-4 flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-foreground/80 hover:text-primary"
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
    <footer className="mt-16 bg-cream pb-20 lg:pb-0">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-4">
            <Wordmark />
            <p className="font-script text-lg text-clay-dark italic">
              Made slowly, by hand, in Sangli.
            </p>
            <address className="text-sm leading-relaxed text-foreground/80 not-italic">
              {address}
              <br />
              {openingHours}
            </address>
            <div className="flex flex-col gap-1 text-sm">
              <a href={`mailto:${contactEmail}`} className="hover:text-primary">
                {contactEmail}
              </a>
              <a href={`tel:${contactPhone}`} className="hover:text-primary">
                {contactPhone}
              </a>
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-primary hover:underline"
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
                    className="flex size-10 items-center justify-center rounded-full bg-background text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
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

        {newsletter && <div className="mt-12">{newsletter}</div>}

        <p className="mt-12 text-xs text-muted-foreground">
          © {year} Poetry &amp; Pottery. Every piece is handmade, so expect
          small differences from the photos.
        </p>
      </div>
    </footer>
  );
}
