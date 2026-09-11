import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { EventLevel, EventType, EventWhen } from "@/graphql/generated/graphql";
import { atViewport } from "@/lib/storybook/viewports";
import { EventFilters } from "./EventFilters";

const meta = {
  title: "Features/Events/EventFilters",
  component: EventFilters,
  parameters: { layout: "padded" },
  args: {
    when: EventWhen.Upcoming,
    eventType: null,
    level: null,
    isLevelShown: false,
    onWhenChange: fn(),
    onEventTypeChange: fn(),
    onLevelChange: fn(),
  },
} satisfies Meta<typeof EventFilters>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Upcoming: Story = {};

export const Workshops: Story = {
  args: {
    eventType: EventType.PotteryWorkshop,
    isLevelShown: true,
  },
};

export const BeginnerWorkshops: Story = {
  args: {
    eventType: EventType.PotteryWorkshop,
    level: EventLevel.Beginner,
    isLevelShown: true,
  },
};

export const OpenMics: Story = {
  args: { eventType: EventType.OpenMic },
};

export const Past: Story = {
  args: { when: EventWhen.Past },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
