import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Gallery, GallerySection, Specimen } from "@/lib/storybook/gallery";
import { atViewport } from "@/lib/storybook/viewports";
import { Slider } from "./slider";

const gallery = (
  <Gallery>
    <GallerySection title="Price filter">
      <Specimen label="Whole range">
        <div className="flex w-full flex-col gap-4 sm:w-64">
          <Slider
            min={500}
            max={12000}
            step={50}
            defaultValue={[500, 12000]}
            aria-label="Price range"
          />
          <p className="flex justify-between text-[13px] text-muted-foreground tnum">
            <span>₹500</span>
            <span>₹12,000</span>
          </p>
        </div>
      </Specimen>
      <Specimen label="Narrowed">
        <div className="flex w-full flex-col gap-4 sm:w-64">
          <Slider
            min={500}
            max={12000}
            step={50}
            defaultValue={[2000, 6500]}
            aria-label="Price range"
          />
          <p className="flex justify-between text-[13px] text-muted-foreground tnum">
            <span>₹2,000</span>
            <span>₹6,500</span>
          </p>
        </div>
      </Specimen>
      <Specimen label="Disabled">
        <div className="w-full sm:w-64">
          <Slider
            min={500}
            max={12000}
            step={50}
            defaultValue={[500, 12000]}
            disabled
            aria-label="Price range"
          />
        </div>
      </Specimen>
    </GallerySection>
  </Gallery>
);

const meta = {
  title: "UI/Slider",
  component: Slider,
  parameters: { layout: "padded" },
  render: () => gallery,
} satisfies Meta<typeof Slider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };
