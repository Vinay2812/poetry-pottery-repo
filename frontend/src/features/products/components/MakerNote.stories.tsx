import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { MakerNote } from "./MakerNote";

const meta = {
  title: "Features/Products/MakerNote",
  component: MakerNote,
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
  args: {
    note: "Crafted with care in deep ocean hue,\nA vessel of warmth, both simple and true.",
  },
} satisfies Meta<typeof MakerNote>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OneSentence: Story = {
  args: {
    note: "The rim went a little oval in the last firing, and it was left that way.",
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
