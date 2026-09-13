import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { AnnouncementForm } from "./AnnouncementForm";

const meta = {
  title: "Features/Admin/Content/AnnouncementForm",
  component: AnnouncementForm,
  parameters: { layout: "fullscreen" },
  args: {
    defaultValues: {
      text: "Open studio this Saturday",
      href: "/events",
    },
    isSaving: false,
    onSubmit: () => {},
  },
} satisfies Meta<typeof AnnouncementForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { defaultValues: { text: "", href: "" } },
};

export const Saving: Story = {
  args: { isSaving: true },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
