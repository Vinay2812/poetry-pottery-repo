import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { SignInWall } from "./SignInWall";

const meta = {
  title: "Features/Auth/SignInWall",
  component: SignInWall,
  parameters: { layout: "fullscreen" },
  args: {
    message: "Sign in to see your basket",
    onSignIn: fn(),
  },
} satisfies Meta<typeof SignInWall>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Bookings: Story = {
  args: { message: "Sign in to see your bookings" },
};

export const LongMessage: Story = {
  args: {
    message: "Sign in to see the pieces you saved and the orders you placed",
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
