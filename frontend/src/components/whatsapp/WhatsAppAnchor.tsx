import type { MouseEvent, ReactNode } from "react";

export interface WhatsAppAnchorProps {
  href: string;
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}

export function WhatsAppAnchor({
  href,
  className,
  ariaLabel,
  children,
  onClick,
}: WhatsAppAnchorProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={className}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {children}
    </a>
  );
}
