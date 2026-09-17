import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";

import { StudioNoteForm } from "./StudioNoteForm";

const meta = {
  title: "Features/Admin/Orders/StudioNoteForm",
  component: StudioNoteForm,
  parameters: { layout: "padded" },
  args: {
    isSending: false,
    photoField: (
      <p className="border border-ash p-3 text-[12px] text-muted-foreground">
        The photo uploader sits here.
      </p>
    ),
    onSubmit: fn(),
  },
} satisfies Meta<typeof StudioNoteForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sending: Story = {
  args: { isSending: true },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
