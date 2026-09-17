import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { MOBILE_MENU_LINKS, buildWhatsAppUrl } from "@/features/layout/types";
import { MobileMenuSheet } from "./MobileMenuSheet";

const meta = {
  title: "Features/Layout/MobileMenuSheet",
  component: MobileMenuSheet,
  parameters: { layout: "fullscreen" },
  args: {
    isOpen: true,
    links: MOBILE_MENU_LINKS,
    activeHref: "/products",
    isSignedIn: false,
    wishlistCount: 0,
    contactPhone: "+91 91234 56789",
    whatsappUrl: buildWhatsAppUrl(
      "+91 91234 56789",
      "Hi, I have a question about Poetry & Pottery.",
    ),
    onOpenChange: fn(),
    onNavigate: fn(),
    onAccountClick: fn(),
    onSignOut: fn(),
  },
} satisfies Meta<typeof MobileMenuSheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SignedOut: Story = {};

export const SignedIn: Story = {
  args: { isSignedIn: true, wishlistCount: 3 },
};

export const OnArchive: Story = {
  args: { activeHref: "/products?view=archive" },
};

// A fresh install has no number on file, and an empty tel: link is a link with no name.
export const NoContactNumber: Story = {
  args: { contactPhone: "", whatsappUrl: null },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
