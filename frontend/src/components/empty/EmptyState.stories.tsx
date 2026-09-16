import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { EmptyState } from "./EmptyState";

const meta = {
  title: "Components/EmptyState",
  component: EmptyState,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="px-4 md:px-8">
        <Story />
      </div>
    ),
  ],
  args: {
    kind: "mug",
    heading: "Your cart is empty",
    line: "Nothing in here yet.",
    actionLabel: "Browse pieces",
    actionHref: "/products",
  },
} satisfies Meta<typeof EmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithLink: Story = {};

export const WithButton: Story = {
  args: {
    kind: "bowl",
    heading: "Nothing matches these filters",
    line: "Loosen one and the shelf fills back up.",
    actionLabel: "Clear filters",
    actionHref: undefined,
    onAction: fn(),
  },
};

export const LongHeading: Story = {
  args: {
    kind: "vase",
    heading: "Nothing matches “cobalt teapot with a bamboo handle”",
    line: "Try a glaze, a clay body or a simpler word.",
    actionLabel: "Clear the search",
    actionHref: undefined,
    onAction: fn(),
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
