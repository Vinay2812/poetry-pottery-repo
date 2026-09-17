import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { OrderCareGuide } from "./OrderCareGuide";

const lines = [
  "Hand wash with a soft cloth, no scouring pad",
  "Let it come to room temperature before it meets the oven",
  "Safe in the microwave, not in the dishwasher",
];

const meta = {
  title: "Features/Orders/OrderCareGuide",
  component: OrderCareGuide,
  decorators: [
    (Story) => (
      <div className="w-full max-w-xl p-4">
        <Story />
      </div>
    ),
  ],
  args: { lines },
} satisfies Meta<typeof OrderCareGuide>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OneLine: Story = { args: { lines: [lines[0]!] } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
