import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { RegistrationStatus } from "@/graphql/generated/graphql";

import { atViewport } from "@/lib/storybook/viewports";
import { AdminRegistrationActions } from "./AdminRegistrationActions";

const meta = {
  title: "Features/Admin/AdminRegistrationActions",
  component: AdminRegistrationActions,
  args: {
    actions: [
      {
        status: RegistrationStatus.Approved,
        label: "Approve, ask for payment",
        isPrimary: true,
        isDestructive: false,
      },
      {
        status: RegistrationStatus.Confirmed,
        label: "Confirm as paid",
        isPrimary: false,
        isDestructive: false,
      },
      {
        status: RegistrationStatus.Rejected,
        label: "Turn down",
        isPrimary: false,
        isDestructive: true,
      },
    ],
    isDisabled: false,
    isStacked: false,
    onAction: fn(),
  },
} satisfies Meta<typeof AdminRegistrationActions>;

export default meta;

type Story = StoryObj<typeof meta>;

export const InARow: Story = {};

export const Stacked: Story = { args: { isStacked: true } };

export const Working: Story = { args: { isDisabled: true } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
