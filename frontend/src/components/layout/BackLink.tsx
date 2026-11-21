import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export interface BackLinkProps {
  href: string;
  label: string;
}

// The quiet way back from a detail page to its list; it stays off printed receipts.
export function BackLink({ href, label }: BackLinkProps) {
  return (
    <Link
      href={href}
      data-print="hide"
      className="-my-2 flex w-fit items-center gap-1.5 py-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft aria-hidden="true" className="size-3.5" strokeWidth={1.5} />
      {label}
    </Link>
  );
}
