import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import {
  FOOTER_HELP_LINKS,
  FOOTER_SHOP_LINKS,
  FOOTER_STUDIO_LINKS,
  buildWhatsAppUrl,
} from "@/features/layout/types";
import { SiteFooter } from "./SiteFooter";

const meta = {
  title: "Features/Layout/SiteFooter",
  component: SiteFooter,
  parameters: { layout: "fullscreen" },
  args: {
    shopLinks: FOOTER_SHOP_LINKS,
    studioLinks: FOOTER_STUDIO_LINKS,
    helpLinks: FOOTER_HELP_LINKS,
    address: "12 Kala Nagar, Sangli, Maharashtra 416416",
    openingHours: "Mon–Sat, 10am–6pm",
    contactEmail: "hello@poetryandpottery.in",
    contactPhone: "+91 91234 56789",
    whatsappUrl: buildWhatsAppUrl(
      "+91 91234 56789",
      "Hi! I have a question about your pottery pieces.",
    ),
    instagramUrl: "https://instagram.com/poetryandpottery",
    facebookUrl: "https://facebook.com/poetryandpottery",
    youtubeUrl: "https://youtube.com/@poetryandpottery",
    year: 2026,
  },
} satisfies Meta<typeof SiteFooter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutSocials: Story = {
  args: { instagramUrl: "", facebookUrl: "", youtubeUrl: "" },
};

export const WithoutWhatsApp: Story = { args: { whatsappUrl: null } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
