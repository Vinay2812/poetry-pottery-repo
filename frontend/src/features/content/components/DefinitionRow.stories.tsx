import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { DefinitionRow } from "./DefinitionRow";

const meta = {
  title: "Features/Content/DefinitionRow",
  component: DefinitionRow,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <dl>
          <Story />
        </dl>
      </div>
    ),
  ],
  args: {
    title: "Thermal shock",
    body: "Do not move a piece straight from the fridge into a hot oven, or pour boiling water into a cold mug.",
  },
} satisfies Meta<typeof DefinitionRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
