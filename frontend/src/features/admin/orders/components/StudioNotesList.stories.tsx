import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";

import type { StudioNoteRow } from "./StudioNotesList";
import { StudioNotesList } from "./StudioNotesList";

const ROWS: StudioNoteRow[] = [
  {
    id: 1,
    body: "Out of the glaze firing this morning. The ash pooled beautifully on the shoulder.",
    imageUrl: "https://placehold.co/1200x900/6f7d6b/ffffff.png",
    sentLabel: "17 Sep 2026",
  },
  {
    id: 2,
    body: "Wrapped and boxed. It goes out with the afternoon pickup.",
    imageUrl: null,
    sentLabel: "18 Sep 2026",
  },
];

const meta = {
  title: "Features/Admin/Orders/StudioNotesList",
  component: StudioNotesList,
  parameters: { layout: "padded" },
  args: { rows: ROWS },
} satisfies Meta<typeof StudioNotesList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { rows: [] },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
