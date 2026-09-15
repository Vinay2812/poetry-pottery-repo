import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { ContactForm } from "./ContactForm";

const meta = {
  title: "Features/Content/ContactForm",
  component: ContactForm,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <Story />
      </div>
    ),
  ],
  args: {
    isSubmitting: false,
    errorMessage: null,
    onSubmit: fn(),
  },
} satisfies Meta<typeof ContactForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Submitting: Story = { args: { isSubmitting: true } };

export const WithServerError: Story = {
  args: {
    errorMessage: "Too many messages from this address. Try again later.",
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
