import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Gallery, GallerySection, Specimen } from "@/lib/storybook/gallery";
import { atViewport } from "@/lib/storybook/viewports";
import { Checkbox } from "./checkbox";
import { Input } from "./input";
import { Label } from "./label";

const gallery = (
  <Gallery>
    <GallerySection title="With input">
      <Specimen label="Default">
        <div className="flex w-full flex-col gap-2 sm:w-72">
          <Label htmlFor="label-name">Your name for the workshop</Label>
          <Input id="label-name" placeholder="e.g. Aisha Potter" />
        </div>
      </Specimen>
      <Specimen label="Disabled field">
        <div className="flex w-full flex-col gap-2 sm:w-72">
          <Label htmlFor="label-slot">Kiln firing slot</Label>
          <Input id="label-slot" placeholder="Friday glaze firing" disabled />
        </div>
      </Specimen>
    </GallerySection>
    <GallerySection title="With checkbox">
      <Specimen label="Inline">
        <div className="flex items-center gap-2">
          <Checkbox id="label-newsletter" />
          <Label htmlFor="label-newsletter">Send me glaze restock news</Label>
        </div>
      </Specimen>
    </GallerySection>
  </Gallery>
);

const meta = {
  title: "UI/Label",
  component: Label,
  parameters: { layout: "padded" },
  render: () => gallery,
} satisfies Meta<typeof Label>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };
