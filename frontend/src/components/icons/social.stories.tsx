import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Gallery, GallerySection, Specimen } from "@/lib/storybook/gallery";
import { atViewport } from "@/lib/storybook/viewports";
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "./social";

const gallery = (
  <Gallery>
    <GallerySection title="Brand marks">
      <Specimen label="Instagram">
        <InstagramIcon className="size-5" />
      </Specimen>
      <Specimen label="Facebook">
        <FacebookIcon className="size-5" />
      </Specimen>
      <Specimen label="YouTube">
        <YoutubeIcon className="size-5" />
      </Specimen>
    </GallerySection>
    <GallerySection title="Footer size against a muted row">
      <Specimen label="Muted">
        <div className="flex items-center gap-4 text-muted-foreground">
          <InstagramIcon className="size-4" />
          <FacebookIcon className="size-4" />
          <YoutubeIcon className="size-4" />
        </div>
      </Specimen>
    </GallerySection>
  </Gallery>
);

const meta = {
  title: "Icons/Social",
  component: InstagramIcon,
  parameters: { layout: "padded" },
  render: () => gallery,
} satisfies Meta<typeof InstagramIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
