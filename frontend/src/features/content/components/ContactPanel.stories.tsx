import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { ContactPanel } from "./ContactPanel";

const meta = {
  title: "Features/Content/ContactPanel",
  component: ContactPanel,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <Story />
      </div>
    ),
  ],
  args: {
    label: "Write to us",
    children: (
      <p className="text-[15px]">
        Thank you, your message is with us. We reply within a day.
      </p>
    ),
  },
} satisfies Meta<typeof ContactPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
