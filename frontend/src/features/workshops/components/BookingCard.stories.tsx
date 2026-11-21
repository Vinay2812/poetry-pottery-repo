import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { BookingCard } from "./BookingCard";

const meta = {
  title: "Features/Workshops/BookingCard",
  component: BookingCard,
  decorators: [
    (Story) => (
      <div className="w-full max-w-xl border-t border-ash">
        <Story />
      </div>
    ),
  ],
  args: {
    href: "/workshops/bookings/WSB7Q2X9M1KD",
    dateLabel: "Sat 19 Sep – Tue 22 Sep",
    whenLines: ["Sat 19 Sep · 2–3 pm", "Tue 22 Sep · 3–4 pm"],
    hours: 2,
    participants: 2,
    total: 3400,
    statusLabel: "Approved, awaiting payment",
    isClosed: false,
  },
} satisfies Meta<typeof BookingCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OnePerson: Story = {
  args: {
    dateLabel: "Sat 19 Sep",
    whenLines: ["Sat 19 Sep · 2–3 pm"],
    hours: 1,
    participants: 1,
    total: 950,
    statusLabel: "Confirmed",
  },
};

export const Cancelled: Story = {
  args: { statusLabel: "Cancelled", isClosed: true },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
