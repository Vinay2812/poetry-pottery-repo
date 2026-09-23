import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { TodayAgendaList } from "./TodayAgendaList";

const meta = {
  title: "Features/Admin/Dashboard/TodayAgendaList",
  component: TodayAgendaList,
  args: {
    rows: [
      {
        id: "SV-1",
        href: "/dashboard/visits",
        kindLabel: "Visit",
        timeLabel: "12:30 pm",
        title: "Rohan Desai",
        detail: "Studio visit",
      },
      {
        id: "WS-1",
        href: "/dashboard/workshops",
        kindLabel: "Wheel",
        timeLabel: "3:00 pm",
        title: "Maya Iyer",
        detail: "Open studio · 2 at the wheel · confirmed",
      },
      {
        id: "3",
        href: "/dashboard/events/3",
        kindLabel: "Evening",
        timeLabel: "7:00 pm",
        title: "Open mic",
        detail: "15 of 20 seats taken",
      },
    ],
  },
} satisfies Meta<typeof TodayAgendaList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const QuietDay: Story = { args: { rows: [] } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
