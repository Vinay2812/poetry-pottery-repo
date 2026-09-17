import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { ReviewItem } from "./ReviewItem";

const meta = {
  title: "Features/Reviews/ReviewItem",
  component: ReviewItem,
  decorators: [
    (Story) => (
      <ul className="w-full max-w-3xl">
        <Story />
      </ul>
    ),
  ],
  args: {
    authorName: "Maya",
    dateLabel: "Tue, 2 Sep 2026",
    rating: 5,
    body: "The glaze pools exactly where the photos said it would. It has become the only mug I reach for.",
    photoUrls: [],
    isMine: false,
    onOpenPhoto: fn(),
  },
} satisfies Meta<typeof ReviewItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Plain: Story = {};

export const RatingOnly: Story = { args: { rating: 3, body: null } };

export const WithPhotos: Story = {
  args: {
    photoUrls: [
      "https://images.pexels.com/photos/18426654/pexels-photo-18426654.jpeg",
      "https://images.pexels.com/photos/8951881/pexels-photo-8951881.jpeg",
    ],
  },
};

export const Mine: Story = {
  args: { isMine: true, onEdit: fn(), onDelete: fn() },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
