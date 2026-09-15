import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { RegistrationCard } from "./RegistrationCard";

const meta = {
  title: "Features/Events/RegistrationCard",
  component: RegistrationCard,
  decorators: [
    (Story) => (
      <div className="w-full max-w-xl border-t border-ash">
        <Story />
      </div>
    ),
  ],
  args: {
    href: "/registrations/REG7Q2X9M1KD",
    eventTitle: "Wheel throwing for beginners",
    imageUrl:
      "https://images.pexels.com/photos/4992831/pexels-photo-4992831.jpeg",
    typeLabel: "Pottery workshop",
    dateLabel: "Thu 17 Sep · 4 pm",
    seats: 2,
    total: 3600,
    statusLabel: "Seat held, awaiting payment",
  },
} satisfies Meta<typeof RegistrationCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Confirmed: Story = { args: { statusLabel: "Confirmed" } };

export const Cancelled: Story = {
  args: { statusLabel: "Cancelled", seats: 1, total: 1800 },
};

export const NoPhoto: Story = { args: { imageUrl: null } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
