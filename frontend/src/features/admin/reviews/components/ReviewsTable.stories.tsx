import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import type { ReviewRow } from "@/features/admin/reviews/types";
import { ReviewsTable } from "./ReviewsTable";

const rows: ReviewRow[] = [
  {
    id: 41,
    rating: 5,
    ratingLabel: "5 out of 5",
    subjectName: "Slate morning mug",
    subjectHref: "/products/slate-morning-mug",
    subjectKindLabel: "Product",
    authorName: "Maya Rao",
    body: "The glaze pools exactly where the photos said it would. It has become the only mug I reach for.",
    photoUrls: [
      "https://images.pexels.com/photos/18426654/pexels-photo-18426654.jpeg",
    ],
    photosLabel: "1 photo",
    leftLabel: "Tue, 1 Sept, 2026",
    isHidden: false,
  },
  {
    id: 40,
    rating: 2,
    ratingLabel: "2 out of 5",
    subjectName: "Evening wheel session",
    subjectHref: "/events/evening-wheel-session",
    subjectKindLabel: "Event",
    authorName: "raj@example.com",
    body: "Rating only",
    photoUrls: [],
    photosLabel: "No photos",
    leftLabel: "Sat, 29 Aug, 2026",
    isHidden: true,
  },
  {
    id: 39,
    rating: 4,
    ratingLabel: "4 out of 5",
    subjectName: "No longer listed",
    subjectHref: null,
    subjectKindLabel: "Product",
    authorName: "Ira Menon",
    body: "Arrived well packed and the clay body feels heavier than it looks.",
    photoUrls: [],
    photosLabel: "No photos",
    leftLabel: "Thu, 20 Aug, 2026",
    isHidden: false,
  },
];

const meta = {
  title: "Features/Admin/Reviews/ReviewsTable",
  component: ReviewsTable,
  parameters: { layout: "fullscreen" },
  args: {
    rows,
    isBusy: false,
    busyId: null,
    onToggleHidden: fn(),
    onDelete: fn(),
  },
} satisfies Meta<typeof ReviewsTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { rows: [] },
};

export const Busy: Story = {
  args: { isBusy: true, busyId: 41 },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
