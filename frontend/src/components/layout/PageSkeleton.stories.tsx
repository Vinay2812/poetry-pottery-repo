import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { PageShell } from "./PageShell";
import {
  SkeletonBlock,
  SkeletonGrid,
  SkeletonHeading,
  SkeletonRows,
} from "./PageSkeleton";

const meta = {
  title: "Layout/PageSkeleton",
  component: SkeletonHeading,
  parameters: { layout: "fullscreen" },
  args: { hasEyebrow: false, hasDescription: true },
  render: (args) => (
    <PageShell className="flex flex-col gap-10 py-8 md:py-12">
      <SkeletonHeading
        hasEyebrow={args.hasEyebrow}
        hasDescription={args.hasDescription}
      />
      <SkeletonGrid count={4} />
      <SkeletonRows count={3} />
      <SkeletonBlock className="h-40 w-full" />
    </PageShell>
  ),
} satisfies Meta<typeof SkeletonHeading>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithEyebrow: Story = { args: { hasEyebrow: true } };

export const Grid: Story = {
  render: () => (
    <PageShell className="py-8 md:py-12">
      <SkeletonGrid count={8} />
    </PageShell>
  ),
};

export const Rows: Story = {
  render: () => (
    <PageShell column="wide" className="py-8 md:py-12">
      <SkeletonRows count={5} />
    </PageShell>
  ),
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
