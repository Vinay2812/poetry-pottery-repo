import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { ArchiveShelfRow } from "./ArchiveShelfRow";
import { ArchiveTile } from "./ArchiveTile";
import { ArchiveYearBlock } from "./ArchiveYearBlock";

const ASK_URL = "https://wa.me/919876543210?text=Hi";

const PHOTOS = [
  "https://images.pexels.com/photos/18426654/pexels-photo-18426654.jpeg",
  "https://images.pexels.com/photos/8951881/pexels-photo-8951881.jpeg",
  "https://images.pexels.com/photos/15028227/pexels-photo-15028227.jpeg",
];

const shelf = (
  <ArchiveShelfRow collection="Rays of reduction">
    {PHOTOS.map((url, index) => (
      <ArchiveTile
        key={url}
        href="/products/drip-sip-mug"
        name={`Reduction piece ${index + 1}`}
        imageUrl={url}
        madeLabel="Made March 2026"
        askUrl={ASK_URL}
      />
    ))}
  </ArchiveShelfRow>
);

const meta = {
  title: "Features/Archive/ArchiveYearBlock",
  component: ArchiveYearBlock,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="px-4 md:px-8">
        <Story />
      </div>
    ),
  ],
  args: { year: "2026", count: 3, children: shelf },
} satisfies Meta<typeof ArchiveYearBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OneShelf: Story = {};

export const TwoShelves: Story = {
  args: {
    count: 6,
    children: (
      <>
        {shelf}
        <ArchiveShelfRow collection="Odd pieces">
          {PHOTOS.map((url, index) => (
            <ArchiveTile
              key={url}
              href="/products/drip-sip-mug"
              name={`Odd piece ${index + 1}`}
              imageUrl={index === 1 ? null : url}
              madeLabel="Made August 2026"
              askUrl={index === 2 ? null : ASK_URL}
            />
          ))}
        </ArchiveShelfRow>
      </>
    ),
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
