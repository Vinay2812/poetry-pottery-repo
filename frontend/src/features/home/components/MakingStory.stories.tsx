import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useEffect } from "react";

import { atViewport } from "@/lib/storybook/viewports";
import { MakingStory } from "./MakingStory";

// The band reads its step from the document root, exactly as it does in the app.
function PinnedAt({ step }: { step: number | null }) {
  useEffect(() => {
    const root = document.documentElement;
    if (step === null) {
      delete root.dataset.step;
      return;
    }
    root.dataset.step = String(step);
    return () => {
      delete root.dataset.step;
    };
  }, [step]);
  return null;
}

function atStep(step: number | null) {
  return {
    decorators: [
      (Story: () => React.ReactElement) => (
        <>
          <PinnedAt step={step} />
          <Story />
        </>
      ),
    ],
  };
}

const meta = {
  title: "Features/Home/MakingStory",
  component: MakingStory,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <Story />
      </div>
    ),
  ],
  args: {
    shopHref: "/products",
    shopLabel: "Shop the shelf",
    onMarkerClick: () => {},
    onMarkerKeyDown: () => {},
  },
} satisfies Meta<typeof MakingStory>;

export default meta;

type Story = StoryObj<typeof meta>;

/** No data-step: the stacked reading that mobile, reduced motion and no JS get. */
export const Stacked: Story = { ...atStep(null) };

export const Mobile: Story = { ...atStep(null), ...atViewport("mobile") };

export const Tablet: Story = { ...atStep(3), ...atViewport("tablet") };

export const Laptop: Story = { ...atStep(3), ...atViewport("laptop") };

export const Desktop: Story = { ...atStep(3), ...atViewport("desktop") };

export const StepOneWedging: Story = {
  ...atStep(0),
  ...atViewport("desktop"),
};

export const StepTwoThrowing: Story = {
  ...atStep(1),
  ...atViewport("desktop"),
};

export const StepThreeTrimming: Story = {
  ...atStep(2),
  ...atViewport("desktop"),
};

export const StepFourBisque: Story = {
  ...atStep(3),
  ...atViewport("desktop"),
};

export const StepFiveGlazing: Story = {
  ...atStep(4),
  ...atViewport("desktop"),
};

export const StepSixFired: Story = {
  ...atStep(5),
  ...atViewport("desktop"),
};
