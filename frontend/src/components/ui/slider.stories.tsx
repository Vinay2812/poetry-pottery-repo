import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Gallery, GallerySection, Specimen } from "@/lib/storybook/gallery";
import { atViewport } from "@/lib/storybook/viewports";
import { Label } from "./label";
import { Slider } from "./slider";

const meta = {
  title: "UI/Slider",
  component: Slider,
  parameters: { layout: "padded" },
  render: () => (
    <Gallery>
      <GallerySection title="Types">
        <Specimen label="Single value">
          <div className="flex w-full flex-col gap-3 sm:w-72">
            <Label htmlFor="slider-price-single">Max price</Label>
            <Slider
              id="slider-price-single"
              aria-label="Max price"
              defaultValue={[600]}
              min={100}
              max={2000}
              step={50}
            />
          </div>
        </Specimen>
        <Specimen label="Range">
          <div className="flex w-full flex-col gap-3 sm:w-72">
            <Label htmlFor="slider-price-range">Price range</Label>
            <Slider
              id="slider-price-range"
              aria-label="Price range"
              defaultValue={[400, 1200]}
              min={100}
              max={2000}
              step={50}
            />
          </div>
        </Specimen>
      </GallerySection>
      <GallerySection title="States">
        <Specimen label="Disabled">
          <div className="flex w-full flex-col gap-3 sm:w-72">
            <Label htmlFor="slider-seats-disabled">Workshop seats</Label>
            <Slider
              id="slider-seats-disabled"
              aria-label="Workshop seats"
              defaultValue={[4]}
              min={1}
              max={12}
              disabled
            />
          </div>
        </Specimen>
      </GallerySection>
    </Gallery>
  ),
} satisfies Meta<typeof Slider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };
