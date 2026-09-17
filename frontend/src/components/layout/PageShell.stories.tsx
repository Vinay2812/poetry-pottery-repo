import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { PageShell } from "./PageShell";

function Ruler({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-3 border-t border-ash py-8">
      <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
        {label}
      </p>
      <h2 className="font-heading text-4xl tracking-tight">
        Every piece on the shelf
      </h2>
      <div className="h-24 bg-ash" />
    </div>
  );
}

const meta = {
  title: "Layout/PageShell",
  component: PageShell,
  parameters: { layout: "fullscreen" },
  args: {
    className: "py-8 md:py-12",
    children: <Ruler label="full" />,
  },
} satisfies Meta<typeof PageShell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Full: Story = {};

export const Wide: Story = {
  args: { column: "wide", children: <Ruler label="wide" /> },
};

export const Narrow: Story = {
  args: { column: "narrow", children: <Ruler label="narrow" /> },
};

export const Stacked: Story = {
  args: {
    className: "py-0",
    children: (
      <>
        <Ruler label="full" />
        <Ruler label="second section" />
      </>
    ),
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
