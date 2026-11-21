"use client";

import { usePathname } from "next/navigation";
import { Toaster as Sonner } from "sonner";

// Storefront: bottom-right on a desktop so a toast lands under the cart it talks
// about; sonner goes full width on a phone, clear of the bottom nav.
// Admin: top centre, because long forms pin Save and Cancel to the bottom.
export function Toaster() {
  const isAdmin = usePathname().startsWith("/dashboard");
  return (
    <Sonner
      position={isAdmin ? "top-center" : "bottom-right"}
      offset={isAdmin ? { top: 16 } : { bottom: 24, right: 24 }}
      mobileOffset={isAdmin ? { top: 16 } : { bottom: 80 }}
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
