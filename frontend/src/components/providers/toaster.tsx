"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

type ToasterPlacement = "storefront" | "admin";

type Placement = Pick<ToasterProps, "position" | "offset" | "mobileOffset">;

// Storefront sits above the cart and bottom nav; admin sits on top, clear of pinned save bars.
const PLACEMENTS: Record<ToasterPlacement, Placement> = {
  storefront: {
    position: "bottom-right",
    offset: { bottom: 24, right: 24 },
    mobileOffset: { bottom: 80 },
  },
  admin: {
    position: "top-center",
    offset: { top: 16 },
    mobileOffset: { top: 16 },
  },
};

export interface ToasterComponentProps {
  placement: ToasterPlacement;
}

export function Toaster({ placement }: ToasterComponentProps) {
  return (
    <Sonner
      position={PLACEMENTS[placement].position}
      offset={PLACEMENTS[placement].offset}
      mobileOffset={PLACEMENTS[placement].mobileOffset}
      duration={3500}
      containerAriaLabel="Studio notices"
      toastOptions={{
        duration: 3500,
        closeButtonAriaLabel: "Dismiss this notice",
        classNames: {
          toast:
            "rounded-none! border-0! bg-ink! font-sans! text-sm! text-white! shadow-none!",
          // The action reads as a text link, not a second button.
          actionButton:
            "rounded-none! bg-transparent! px-0! font-normal! text-white! underline underline-offset-4 hover:opacity-80",
        },
      }}
    />
  );
}
