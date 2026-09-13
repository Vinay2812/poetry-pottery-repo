import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { ProcessStep } from "./ProcessStep";

const meta = {
  title: "Features/Content/ProcessStep",
  component: ProcessStep,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <ol className="grid gap-6 md:grid-cols-4">
          <Story />
        </ol>
      </div>
    ),
  ],
  args: {
    index: 0,
    title: "Wedging",
    body: "Air bubbles are worked out of the clay so it fires evenly.",
  },
} satisfies Meta<typeof ProcessStep>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
