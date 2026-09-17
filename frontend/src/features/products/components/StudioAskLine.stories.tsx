import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { StudioAskLine } from "./StudioAskLine";

const meta = {
  title: "Features/Products/StudioAskLine",
  component: StudioAskLine,
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
  args: {
    text: "Something else in mind?",
    linkLabel: "Message the studio.",
    askUrl: "https://wa.me/919876543210?text=Hi",
  },
} satisfies Meta<typeof StudioAskLine>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutWhatsApp: Story = { args: { askUrl: null } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
