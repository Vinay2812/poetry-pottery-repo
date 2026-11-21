import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { StudioTeaser } from "./StudioTeaser";

const meta = {
  title: "Features/Home/StudioTeaser",
  component: StudioTeaser,
  parameters: { layout: "padded" },
  args: {
    imageUrl: null,
    line: "Nothing coming up on the calendar, but the wheels keep their usual hours. Pick a time and we will set one up for you.",
    hoursLabel: "1 to 7 pm",
    daysLabel: "Every day except Monday",
    priceLabel: "From ₹1,100 a person for an hour",
    href: "/workshops",
    linkLabel: "Book a wheel session",
  },
} satisfies Meta<typeof StudioTeaser>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithPhoto: Story = {
  args: {
    imageUrl:
      "https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg",
  },
};

export const Closed: Story = {
  args: {
    line: "Nothing coming up on the calendar, and the wheels are resting for now. Write to us and we will tell you when they turn again.",
    hoursLabel: null,
    daysLabel: null,
    priceLabel: null,
    href: "/contact",
    linkLabel: "Write to us",
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
