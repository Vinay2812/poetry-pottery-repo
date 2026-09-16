import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { StudioNote } from "./StudioNote";

const meta = {
  title: "Features/Orders/StudioNote",
  component: StudioNote,
  decorators: [
    (Story) => (
      <ul className="w-full max-w-xl p-4">
        <Story />
      </ul>
    ),
  ],
  args: {
    body: "Your mug came out of the glaze firing this morning. The rim caught a little more sage than usual, which we rather like.",
    imageUrl:
      "https://images.pexels.com/photos/18426654/pexels-photo-18426654.jpeg",
    writtenOn: "Tue, 15 Sep 2026, 9:10 am",
  },
} satisfies Meta<typeof StudioNote>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithPhoto: Story = {};

export const WordsOnly: Story = { args: { imageUrl: null } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
