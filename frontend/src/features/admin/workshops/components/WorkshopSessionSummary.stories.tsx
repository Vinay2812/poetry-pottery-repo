import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { WorkshopSessionSummary } from "./WorkshopSessionSummary";

const meta = {
  title: "Features/Admin/Workshops/WorkshopSessionSummary",
  component: WorkshopSessionSummary,
  args: {
    setupName: null,
    sessionLines: ["Sun 22 Nov · 4–5 pm"],
    sizeLabel: "1 hour · 1 person",
    totalLabel: "₹1,100",
  },
} satisfies Meta<typeof WorkshopSessionSummary>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OneDay: Story = {};

export const SplitAcrossDays: Story = {
  args: {
    sessionLines: ["Wed 25 Nov · 3–4 pm", "Sat 28 Nov · 4–5 pm"],
    sizeLabel: "2 hours · 2 people",
    totalLabel: "₹4,000",
  },
};

export const NamesItsSetup: Story = {
  args: { setupName: "Hand building" },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
