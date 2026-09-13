import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { MakingPiece } from "./MakingPiece";

const meta = {
  title: "Features/Home/MakingPiece",
  component: MakingPiece,
  decorators: [
    (Story) => (
      <div className="aspect-square w-full max-w-md bg-clay-white">
        <Story />
      </div>
    ),
  ],
  args: { step: 0 },
} satisfies Meta<typeof MakingPiece>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Wedging: Story = {};

export const Throwing: Story = { args: { step: 1 } };

export const Trimming: Story = { args: { step: 2 } };

export const Bisque: Story = { args: { step: 3 } };

export const Glazing: Story = { args: { step: 4 } };

export const Fired: Story = { args: { step: 5 } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
