"use client";

import { type ReactNode, useCallback } from "react";

import { useRecordWhatsAppMessageMutation } from "@/graphql/generated/graphql";

import { toWhatsAppBody } from "@/features/layout/types";

import { WhatsAppAnchor } from "./WhatsAppAnchor";

export interface WhatsAppLinkProps {
  href: string;
  kind: string;
  reference?: string | null;
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
}

// The copy is best effort: the tap must open WhatsApp whether or not the record lands.
export function WhatsAppLink({
  href,
  kind,
  reference = null,
  className,
  ariaLabel,
  children,
}: WhatsAppLinkProps) {
  const [recordMessage] = useRecordWhatsAppMessageMutation();

  const handleClick = useCallback(() => {
    const body = toWhatsAppBody(href);
    if (body === null) return;
    recordMessage({
      variables: {
        input: { kind, body, reference, page_url: window.location.href },
      },
    }).catch(() => undefined);
  }, [href, kind, recordMessage, reference]);

  return (
    <WhatsAppAnchor
      href={href}
      className={className}
      ariaLabel={ariaLabel}
      onClick={handleClick}
    >
      {children}
    </WhatsAppAnchor>
  );
}
