import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { KilnLabels } from "@/components/motion/KilnLabels";
import { atViewport } from "@/lib/storybook/viewports";
import { ProductGallery } from "./ProductGallery";

const PHOTOS = [
  "https://images.pexels.com/photos/18426654/pexels-photo-18426654.jpeg",
  "https://images.pexels.com/photos/8951881/pexels-photo-8951881.jpeg",
  "https://images.pexels.com/photos/15028227/pexels-photo-15028227.jpeg",
  "https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg",
];

const meta = {
  title: "Features/Products/ProductGallery",
  component: ProductGallery,
  decorators: [
    (Story) => (
      <div className="w-full max-w-xl">
        <Story />
      </div>
    ),
  ],
  args: {
    name: "Slate morning mug",
    images: PHOTOS.slice(0, 3),
  },
} satisfies Meta<typeof ProductGallery>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SinglePhoto: Story = {
  args: { images: PHOTOS.slice(0, 1) },
};

export const TwoPhotos: Story = {
  args: { images: PHOTOS.slice(0, 2) },
};

export const FourPhotos: Story = {
  args: { images: PHOTOS },
};

export const NoPhotos: Story = {
  args: { images: [] },
};

// The kiln labels only ride along when there is no photo to keep clean.
export const NoPhotosWithKilnLabels: Story = {
  args: {
    images: [],
    overlay: (
      <KilnLabels
        isAnimated={false}
        className="text-ink"
        labels={[
          { text: "Clay body", x: 30, y: 26, anchorX: 38, anchorY: 38 },
          { text: "Glaze", x: 68, y: 52, anchorX: 62, anchorY: 55 },
          { text: "Size", x: 62, y: 82, anchorX: 50, anchorY: 72 },
        ]}
      />
    ),
  },
};

export const Mobile: Story = {
  ...atViewport("mobile"),
  args: { images: PHOTOS },
};

export const Tablet: Story = {
  ...atViewport("tablet"),
  args: { images: PHOTOS },
};

export const Laptop: Story = {
  ...atViewport("laptop"),
  args: { images: PHOTOS },
};

export const Desktop: Story = {
  ...atViewport("desktop"),
  args: { images: PHOTOS },
};

export const MobileOnePhoto: Story = {
  ...atViewport("mobile"),
  args: { images: PHOTOS.slice(0, 1) },
};

export const DesktopTwoPhotos: Story = {
  ...atViewport("desktop"),
  args: { images: PHOTOS.slice(0, 2) },
};
