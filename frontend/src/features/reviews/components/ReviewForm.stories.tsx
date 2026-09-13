import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { ReviewForm } from "./ReviewForm";

const meta = {
  title: "Features/Reviews/ReviewForm",
  component: ReviewForm,
  decorators: [
    (Story) => (
      <div className="w-full max-w-lg">
        <Story />
      </div>
    ),
  ],
  args: {
    defaultRating: 0,
    defaultBody: "",
    defaultPhotoUrls: [],
    isSubmitting: false,
    isUploading: false,
    submitLabel: "Post review",
    onSubmit: fn(),
    onUploadPhoto: fn(async () => null),
    onCancel: fn(),
  },
} satisfies Meta<typeof ReviewForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Blank: Story = {};

export const Editing: Story = {
  args: {
    defaultRating: 4,
    defaultBody: "Arrived well packed and the handle sits right in the hand.",
    submitLabel: "Save changes",
  },
};

export const Posting: Story = { args: { isSubmitting: true } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
