import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { AdminRegistrationWho } from "./AdminRegistrationWho";

const meta = {
  title: "Features/Admin/AdminRegistrationWho",
  component: AdminRegistrationWho,
  args: {
    name: "Maya Iyer",
    email: "maya@example.com",
    reference: "WS-HJN2NGS3UP",
    bookedLabel: "Sat, 21 Nov, 2026",
  },
} satisfies Meta<typeof AdminRegistrationWho>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongEmail: Story = {
  args: {
    email: "a.very.long.unbroken.address.for.the.studio.inbox@example.com",
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
