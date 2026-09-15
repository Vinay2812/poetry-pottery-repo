import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { NewsletterForm } from "./NewsletterForm";

const meta = {
  title: "Features/Content/NewsletterForm",
  component: NewsletterForm,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <Story />
      </div>
    ),
  ],
  args: {
    email: "",
    state: "idle",
    message: null,
    onEmailChange: fn(),
    onSubmit: fn(),
  },
} satisfies Meta<typeof NewsletterForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
  args: { email: "maya@example.com" },
};

export const Subscribed: Story = {
  args: {
    state: "subscribed",
    message: "You are on the list. We write when a batch comes out.",
  },
};

export const WithError: Story = {
  args: {
    email: "maya@",
    state: "error",
    message: "Enter a valid email address",
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
