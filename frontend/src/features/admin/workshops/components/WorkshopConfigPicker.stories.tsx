import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { WorkshopConfigPicker } from "./WorkshopConfigPicker";

const meta = {
  title: "Features/Admin/Workshops/WorkshopConfigPicker",
  component: WorkshopConfigPicker,
  args: {
    options: [
      { value: "1", label: "Wheel session" },
      { value: "2", label: "Hand building" },
    ],
    value: "1",
    onChange: () => {},
  },
} satisfies Meta<typeof WorkshopConfigPicker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TwoStudios: Story = {};

export const SecondPicked: Story = {
  args: { value: "2" },
};

export const OneStudioHidesItself: Story = {
  args: { options: [{ value: "1", label: "Wheel session" }] },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
