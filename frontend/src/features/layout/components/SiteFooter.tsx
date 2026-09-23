import Link from "next/link";

import {
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
} from "@/components/icons/social";
import { PageShell } from "@/components/layout/PageShell";
import { toPhoneHref } from "@/lib/format";

import { Wordmark } from "@/features/layout/components/Wordmark";
import type { NavLink } from "@/features/layout/types";
import { WhatsAppLink } from "@/components/whatsapp/WhatsAppLink";

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
              className="link-underline text-[13px] text-foreground"
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
  const phoneHref = toPhoneHref(contactPhone);

  return (
    <footer
      data-print="hide"
      className="mt-20 border-t border-ash bg-background pb-20 lg:pb-0"
    >
      <PageShell className="py-12 md:py-16">
        {/* The column headings are h3s; this is the h2 they hang from. */}
        <h2 className="sr-only">More from the studio</h2>
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-4">
            <Wordmark />
            <address className="text-[13px] leading-relaxed text-muted-foreground not-italic">
              {address}
              <br />
              {openingHours}
            </address>
            <div className="flex flex-col gap-1 text-[13px]">
              <a href={`mailto:${contactEmail}`} className="link-underline">
                {contactEmail}
              </a>
              {phoneHref && (
                <a href={phoneHref} className="link-underline">
                  {contactPhone}
                </a>
              )}
              {whatsappUrl && (
                <WhatsAppLink
                  href={whatsappUrl}
                  kind="general"
                  className="link-underline text-primary"
                >
                  Message us on WhatsApp
                </WhatsAppLink>
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
      </PageShell>
    </footer>
  );
}
