import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { GlazeNote } from "./GlazeNote";

const meta = {
  title: "Features/Products/GlazeNote",
  component: GlazeNote,
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
  args: {
    name: "Ocean Blue",
    colorCode: "#3F6C8F",
    swatchUrl: null,
    description:
      "A deep blue that thins to grey on the rims and gathers dark in the throwing rings.",
    variationNote:
      "How dark it goes depends on where the piece stood in the kiln, so no two pots match.",
    href: "/products?glaze=ocean-blue",
  },
} satisfies Meta<typeof GlazeNote>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WoodFired: Story = {
  args: {
    name: "Wood Fired",
    colorCode: "#8A6A4B",
    description:
      "Fired with wood, so ash carried through the kiln lands on the piece and melts into the surface.",
    variationNote:
      "The side facing the firebox takes more ash, so each piece is given a front and a back.",
    href: "/products?glaze=wood-fired",
  },
};

export const WithoutVariationNote: Story = {
  args: { variationNote: null },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
