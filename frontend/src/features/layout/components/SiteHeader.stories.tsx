import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { NAV_LINKS } from "@/features/layout/types";
import { SiteHeader } from "./SiteHeader";

// Inline SVG data URI so the avatar renders without a network fetch.
const AVATAR_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Ccircle cx='32' cy='32' r='32' fill='%234F6F52'/%3E%3Ctext x='32' y='41' font-size='28' text-anchor='middle' fill='%23ffffff' font-family='sans-serif'%3EA%3C/text%3E%3C/svg%3E";

const meta = {
  title: "Features/Layout/SiteHeader",
  component: SiteHeader,
  parameters: { layout: "fullscreen" },
  args: {
    navLinks: NAV_LINKS,
    activeHref: "/products",
    cartCount: 0,
    wishlistCount: 0,
    isSignedIn: false,
    isAdmin: false,
    userImageUrl: null,
    onSearchClick: fn(),
    onAccountClick: fn(),
  },
} satisfies Meta<typeof SiteHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SignedOut: Story = {};

export const SignedIn: Story = {
  args: { isSignedIn: true, userImageUrl: AVATAR_URL },
};

export const Admin: Story = {
  args: { isSignedIn: true, isAdmin: true, userImageUrl: AVATAR_URL },
};

export const WithCounts: Story = {
  args: {
    isSignedIn: true,
    userImageUrl: AVATAR_URL,
    cartCount: 3,
    wishlistCount: 12,
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
