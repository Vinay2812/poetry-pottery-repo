import Link from "next/link";

export interface StudioTeaserProps {
  line: string;
  href: string;
  linkLabel: string;
}

// Stands in for the event rows when nothing is on the calendar, so the studio's
// second way in never disappears from the home page.
export function StudioTeaser({ line, href, linkLabel }: StudioTeaserProps) {
  return (
    <div className="flex flex-col items-start gap-4 border-t border-ash py-8">
      <p className="max-w-xl text-[15px] leading-relaxed">{line}</p>
      <Link
        href={href}
        className="w-fit border-b border-ink pb-0.5 text-sm hover:border-primary hover:text-primary"
      >
        {linkLabel}
      </Link>
    </div>
  );
}
