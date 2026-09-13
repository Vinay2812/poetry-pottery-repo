import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { ReviewItem } from "./ReviewItem";
import { ReviewsSection } from "./ReviewsSection";

const meta = {
  title: "Features/Reviews/ReviewsSection",
  component: ReviewsSection,
  decorators: [
    (Story) => (
      <div className="w-full max-w-4xl">
        <Story />
      </div>
    ),
  ],
  args: {
    title: "Reviews",
    average: 4.5,
    count: 4,
    distribution: [0, 0, 0, 2, 2],
    quietLine: "Reviews come from people who bought this piece",
    ctaLabel: "Write a review",
    isLoading: false,
    isPending: false,
    hasMore: true,
    isLoadingMore: false,
    onWriteReview: fn(),
    onLoadMore: fn(),
    children: (
      <>
        <ReviewItem
          authorName="Maya"
          dateLabel="Tue, 2 Sep 2026"
          rating={5}
          body="The glaze pools exactly where the photos said it would."
          photoUrls={[]}
          isMine={false}
        />
        <ReviewItem
          authorName="Ravi"
          dateLabel="Sat, 16 Aug 2026"
          rating={4}
          body="Packed carefully and the size is right for a morning coffee."
          photoUrls={[]}
          isMine={false}
        />
      </>
    ),
  },
} satisfies Meta<typeof ReviewsSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithReviews: Story = {};

export const NotEligible: Story = { args: { ctaLabel: null } };

export const Empty: Story = {
  args: {
    average: 0,
    count: 0,
    distribution: [0, 0, 0, 0, 0],
    hasMore: false,
    children: null,
  },
};

export const Loading: Story = { args: { isLoading: true } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
