import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Gallery, GallerySection, Specimen } from "@/lib/storybook/gallery";
import { atViewport } from "@/lib/storybook/viewports";
import { FireIcon, GlazeIcon, ThrowIcon, WedgeIcon } from "./pottery";

const gallery = (
  <Gallery>
    <GallerySection title="How a piece is made">
      <Specimen label="Wedge">
        <WedgeIcon />
      </Specimen>
      <Specimen label="Throw">
        <ThrowIcon />
      </Specimen>
      <Specimen label="Fire">
        <FireIcon />
      </Specimen>
      <Specimen label="Glaze">
        <GlazeIcon />
      </Specimen>
    </GallerySection>
  </Gallery>
);

const meta = {
  title: "Icons/Pottery",
  component: WedgeIcon,
  parameters: { layout: "padded" },
  render: () => gallery,
} satisfies Meta<typeof WedgeIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
