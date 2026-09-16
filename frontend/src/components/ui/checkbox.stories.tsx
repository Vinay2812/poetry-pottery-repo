import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Gallery, GallerySection, Specimen } from "@/lib/storybook/gallery";
import { atViewport } from "@/lib/storybook/viewports";
import { Checkbox } from "./checkbox";
import { Label } from "./label";

const gallery = (
  <Gallery>
    <GallerySection title="Filter rows">
      <Specimen label="Unchecked">
        <div className="flex items-center gap-3">
          <Checkbox id="category-mugs" />
          <Label htmlFor="category-mugs">Mugs</Label>
        </div>
      </Specimen>
      <Specimen label="Checked">
        <div className="flex items-center gap-3">
          <Checkbox id="category-bowls" defaultChecked />
          <Label htmlFor="category-bowls">Bowls</Label>
        </div>
      </Specimen>
      <Specimen label="Disabled">
        <div className="flex items-center gap-3">
          <Checkbox id="category-planters" disabled />
          <Label htmlFor="category-planters">Planters</Label>
        </div>
      </Specimen>
    </GallerySection>
    <GallerySection title="Address form">
      <Specimen label="Make default">
        <div className="flex items-center gap-3">
          <Checkbox id="address-default" defaultChecked />
          <Label htmlFor="address-default">
            Use this as my default address
          </Label>
        </div>
      </Specimen>
    </GallerySection>
  </Gallery>
);

const meta = {
  title: "UI/Checkbox",
  component: Checkbox,
  parameters: { layout: "padded" },
  render: () => gallery,
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };
