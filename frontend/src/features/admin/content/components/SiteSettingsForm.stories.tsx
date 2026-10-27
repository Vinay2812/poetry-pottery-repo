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
      commission_intro:
        "Tell us what to make, how big and in which glaze. We sketch it, throw it and fire it, and it reaches you in about ten days.",
      commission_steps: [
        {
          title: "You send the brief",
          detail:
            "The piece, the size, the glaze and the words, in the form below.",
        },
        {
          title: "We sketch it, within two days",
          detail:
            "A drawing and a price come back by email. Nothing is owed yet.",
        },
        {
          title: "It is thrown",
          detail:
            "One sitting at the wheel, then a week drying to leather-hard.",
        },
        {
          title: "It is glazed and fired",
          detail:
            "Bisque, then the glaze firing at 1225°C. The kiln decides the rest.",
        },
        {
          title: "It ships, about ten days in",
          detail:
            "Packed in straw and paper, tracked, to the address you give us.",
        },
      ],
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

export const OneStep: Story = {
  args: {
    defaultValues: {
      ...meta.args.defaultValues,
      commission_steps: meta.args.defaultValues.commission_steps.slice(0, 1),
    },
  },
};

export const EightSteps: Story = {
  args: {
    defaultValues: {
      ...meta.args.defaultValues,
      commission_steps: Array.from({ length: 8 }, (_, index) => ({
        title: `Step ${index + 1}`,
        detail: "One line on what happens and how long it takes.",
      })),
    },
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
