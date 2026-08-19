import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { Gallery, GallerySection, Specimen } from "@/lib/storybook/gallery";
import { atViewport } from "@/lib/storybook/viewports";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

const gallery = (
  <Gallery>
    <GallerySection title="Triggers">
      <Specimen label="Outline trigger">
        <Popover onOpenChange={fn()}>
          <PopoverTrigger asChild>
            <Button variant="outline">Kiln notes</Button>
          </PopoverTrigger>
          <PopoverContent className="w-72" aria-label="Kiln notes">
            <p className="text-sm font-semibold">Cone 6 glaze firing</p>
          </PopoverContent>
        </Popover>
      </Specimen>
      <Specimen label="Default trigger">
        <Popover onOpenChange={fn()}>
          <PopoverTrigger asChild>
            <Button>Workshop details</Button>
          </PopoverTrigger>
          <PopoverContent className="w-72" aria-label="Workshop details">
            <p className="text-sm font-semibold">Beginner wheel throwing</p>
          </PopoverContent>
        </Popover>
      </Specimen>
      <Specimen label="Ghost trigger">
        <Popover onOpenChange={fn()}>
          <PopoverTrigger asChild>
            <Button variant="ghost">Delivery info</Button>
          </PopoverTrigger>
          <PopoverContent className="w-72" aria-label="Delivery info">
            <p className="text-sm font-semibold">Insured door to door</p>
          </PopoverContent>
        </Popover>
      </Specimen>
    </GallerySection>
    <GallerySection title="Open">
      <Specimen label="Open popover">
        <div className="pb-56">
          <Popover open onOpenChange={fn()}>
            <PopoverTrigger asChild>
              <Button variant="outline">Kiln notes</Button>
            </PopoverTrigger>
            <PopoverContent className="w-72" aria-label="Kiln notes">
              <div className="space-y-1.5">
                <p className="text-sm font-semibold">Cone 6 glaze firing</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Pieces come out of the kiln after a slow 36-hour cool. Collect
                  yours from the studio on Saturday.
                </p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </Specimen>
    </GallerySection>
  </Gallery>
);

const meta = {
  title: "UI/Popover",
  component: Popover,
  parameters: { layout: "padded" },
  render: () => gallery,
} satisfies Meta<typeof Popover>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };
