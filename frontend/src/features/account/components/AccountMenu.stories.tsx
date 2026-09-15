import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { AccountMenu } from "./AccountMenu";

const meta = {
  title: "Features/Account/AccountMenu",
  component: AccountMenu,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <Story />
      </div>
    ),
  ],
  args: {
    displayName: "Maya Iyer",
    email: "maya.iyer@example.com",
    imageUrl:
      "https://images.pexels.com/photos/18426654/pexels-photo-18426654.jpeg",
    memberSince: "Sep 2024",
    isAdmin: false,
    onManageProfile: fn(),
    onSignOut: fn(),
  },
} satisfies Meta<typeof AccountMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Member: Story = {};

export const Admin: Story = {
  args: { isAdmin: true },
};

export const NoImage: Story = {
  args: { imageUrl: null },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
