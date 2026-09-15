import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { ContentHeader } from "./ContentHeader";

const meta = {
  title: "Features/Content/ContentHeader",
  component: ContentHeader,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <Story />
      </div>
    ),
  ],
  args: {
    title: "Questions, answered",
    subtitle: "Everything you might want to know before you order or book.",
  },
} satisfies Meta<typeof ContentHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutSubtitle: Story = { args: { subtitle: null } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
