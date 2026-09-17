import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { SuggestionRow } from "./SuggestionRow";

const meta = {
  title: "Features/Search/SuggestionRow",
  component: SuggestionRow,
  decorators: [
    (Story) => (
      <ul role="listbox" aria-label="Suggestions" className="w-96">
        <Story />
      </ul>
    ),
  ],
  args: {
    id: "search-option-0",
    label: "Slate morning mug",
    note: "₹850",
    hasThumbnail: true,
    imageUrl:
      "https://images.pexels.com/photos/18426654/pexels-photo-18426654.jpeg",
    isActive: false,
    onSelect: fn(),
    onHover: fn(),
  },
} satisfies Meta<typeof SuggestionRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Piece: Story = {};

export const Highlighted: Story = { args: { isActive: true } };

export const NoPhoto: Story = {
  args: { imageUrl: null, note: "In the archive" },
};

export const PlainRow: Story = {
  args: { hasThumbnail: false, label: "sage green", note: null },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
