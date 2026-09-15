import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { ContactDetails } from "./ContactDetails";

const meta = {
  title: "Features/Content/ContactDetails",
  component: ContactDetails,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <Story />
      </div>
    ),
  ],
  args: {
    address: "12 Kala Nagar, Sangli, Maharashtra 416416",
    openingHours: "Tuesday to Sunday, 1 pm to 7 pm",
    contactPhone: "+91 91234 56789",
    contactEmail: "hello@poetryandpottery.in",
    whatsappUrl: "https://wa.me/919123456789",
    instagramUrl: "https://instagram.com/poetryandpottery",
    facebookUrl: "https://facebook.com/poetryandpottery",
  },
} satisfies Meta<typeof ContactDetails>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutSocials: Story = {
  args: { whatsappUrl: null, instagramUrl: "", facebookUrl: "" },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
