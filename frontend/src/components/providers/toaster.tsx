"use client";

import { Toaster as Sonner } from "sonner";

// Bottom-right on a desktop so a toast lands under the cart it talks about;
// sonner goes full width on a phone, clear of the bottom nav.
export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      offset={{ bottom: 24, right: 24 }}
      mobileOffset={{ bottom: 80 }}
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
