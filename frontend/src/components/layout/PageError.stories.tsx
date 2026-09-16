import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { PageError } from "./PageError";
import { PageShell } from "./PageShell";

const meta = {
  title: "Layout/PageError",
  component: PageError,
  parameters: { layout: "fullscreen" },
  args: {
    title: "This page did not load",
    message:
      "Something went wrong on our side, not yours. Try again, and if it keeps happening, message us and we will sort it out.",
    onRetry: () => {},
  },
  render: (args) => (
    <PageShell>
      <PageError
        title={args.title}
        message={args.message}
        retryLabel={args.retryLabel}
        onRetry={args.onRetry}
      />
    </PageShell>
  ),
} satisfies Meta<typeof PageError>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomRetry: Story = { args: { retryLabel: "Reload the studio" } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
