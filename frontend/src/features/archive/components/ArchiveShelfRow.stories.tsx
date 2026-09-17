import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { ArchiveShelfRow } from "./ArchiveShelfRow";
import { ArchiveTile } from "./ArchiveTile";

const ASK_URL = "https://wa.me/919876543210?text=Hi";

const PHOTOS = [
  "https://images.pexels.com/photos/18426654/pexels-photo-18426654.jpeg",
  "https://images.pexels.com/photos/8951881/pexels-photo-8951881.jpeg",
  "https://images.pexels.com/photos/15028227/pexels-photo-15028227.jpeg",
  "https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg",
];

function tiles(count: number) {
  return PHOTOS.slice(0, count).map((url, index) => (
    <ArchiveTile
      key={url}
      href="/products/drip-sip-mug"
      name={`Piece ${index + 1}`}
      imageUrl={url}
      madeLabel="Made March 2026"
      askUrl={ASK_URL}
    />
  ));
}

const meta = {
  title: "Features/Archive/ArchiveShelfRow",
  component: ArchiveShelfRow,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="px-4 md:px-8">
        <Story />
      </div>
    ),
  ],
  args: { collection: "Winter 2025 collection", children: tiles(3) },
} satisfies Meta<typeof ArchiveShelfRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ThreePieces: Story = {};

export const OnePiece: Story = {
  args: { collection: "Odd pieces", children: tiles(1) },
};

export const FourPieces: Story = { args: { children: tiles(4) } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
