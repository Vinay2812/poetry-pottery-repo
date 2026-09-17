import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { WAITING_LINE } from "@/features/notify/types";
import { NextBatchForm } from "./NextBatchForm";

const meta = {
  title: "Features/Notify/NextBatchForm",
  component: NextBatchForm,
  decorators: [
    (Story) => (
      <div className="w-full max-w-md p-4">
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
} satisfies Meta<typeof NextBatchForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Prefilled: Story = { args: { email: "maya@example.com" } };

export const Waiting: Story = {
  args: { state: "waiting", message: WAITING_LINE },
};

export const Refused: Story = {
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
