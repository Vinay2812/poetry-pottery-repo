import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { ContentTextField } from "./ContentTextField";

const registration = {
  name: "title",
  onChange: async () => true,
  onBlur: async () => true,
  ref: () => {},
};

const meta = {
  title: "Features/Admin/Content/ContentTextField",
  component: ContentTextField,
  args: {
    id: "content-title",
    label: "Title",
    hint: null,
    error: undefined,
    isMultiline: false,
    registration,
  },
} satisfies Meta<typeof ContentTextField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHint: Story = {
  args: { hint: "Shown at the top of the page." },
};

export const WithError: Story = {
  args: { error: "Title is required" },
};

export const Multiline: Story = {
  args: { id: "content-body", label: "Body", isMultiline: true },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
