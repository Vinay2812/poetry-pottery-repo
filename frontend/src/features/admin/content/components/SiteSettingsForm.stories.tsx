import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { SiteSettingsForm } from "./SiteSettingsForm";

const heroField = (
  <div className="border border-ash p-4 text-[13px] text-muted-foreground">
    Hero image uploader
  </div>
);

const meta = {
  title: "Features/Admin/Content/SiteSettingsForm",
  component: SiteSettingsForm,
  parameters: { layout: "fullscreen" },
  args: {
    defaultValues: {
      contact_email: "studio@poetryandpottery.in",
      contact_phone: "9876543210",
      whatsapp_number: "9876543210",
      address: "12 Kiln Lane, Sangli, Maharashtra",
      opening_hours: "Tue to Sun, 10am to 6pm",
      instagram_url: "https://instagram.com/poetryandpottery",
      facebook_url: "",
      youtube_url: "",
      shipping_flat_fee: "80",
      dispatch_days_min: "7",
      dispatch_days_max: "12",
      free_shipping_above: "1500",
      hero_heading: "Pottery made slowly.",
      hero_subheading: "Stoneware and terracotta from a small wheel studio.",
      hero_cta_text: "Shop the shelf",
      hero_cta_href: "/products",
    },
    isSaving: false,
    heroField,
    onSubmit: () => {},
  },
} satisfies Meta<typeof SiteSettingsForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Saving: Story = {
  args: { isSaving: true },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
