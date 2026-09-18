import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { StudioTeaser } from "./StudioTeaser";

const meta = {
  title: "Features/Home/StudioTeaser",
  component: StudioTeaser,
  parameters: { layout: "padded" },
  args: {
    imageUrl: null,
    line: "Nothing is on the calendar this week, but the wheels are free most afternoons. Pick an hour and we will set one up for you.",
    hoursLabel: "1 to 7 pm",
    daysLabel: "Every day but Monday",
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

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
