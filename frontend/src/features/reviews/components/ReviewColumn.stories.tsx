import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { ReviewColumn } from "./ReviewColumn";

const meta = {
  title: "Features/Reviews/ReviewColumn",
  component: ReviewColumn,
  decorators: [
    (Story) => (
      <div className="w-full max-w-sm">
        <Story />
      </div>
    ),
  ],
  args: {
    authorName: "Maya",
    rating: 5,
    line: "The glaze pools exactly where the photos said it would.",
    subjectName: "Slate morning mug",
    href: "/products/slate-morning-mug",
  },
} satisfies Meta<typeof ReviewColumn>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Linked: Story = {};

export const WithoutSubject: Story = {
  args: { subjectName: null, href: null },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
