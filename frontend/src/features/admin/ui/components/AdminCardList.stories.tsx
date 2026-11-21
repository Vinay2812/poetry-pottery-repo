import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { ADMIN_CARD, AdminCardList } from "./AdminCardList";

const meta = {
  title: "Features/Admin/AdminCardList",
  component: AdminCardList,
  args: {
    caption: "Wheel bookings",
    isBusy: false,
    isEmpty: false,
    emptyMessage: "No bookings match those filters",
    children: (
      <>
        <li className={ADMIN_CARD}>Maya Iyer · Sun 22 Nov · 3–4 pm</li>
        <li className={ADMIN_CARD}>Arjun Rao · Tue 24 Nov · 1–2 pm</li>
      </>
    ),
  },
} satisfies Meta<typeof AdminCardList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = { args: { isBusy: true } };

export const Empty: Story = { args: { isEmpty: true } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
