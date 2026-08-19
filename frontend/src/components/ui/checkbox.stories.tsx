import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Gallery, GallerySection, Specimen } from "@/lib/storybook/gallery";
import { atViewport } from "@/lib/storybook/viewports";
import { Checkbox } from "./checkbox";
import { Label } from "./label";

const gallery = (
  <Gallery>
    <GallerySection title="States">
      <Specimen label="Unchecked">
        <div className="flex items-center gap-2">
          <Checkbox id="cb-hand-thrown" />
          <Label htmlFor="cb-hand-thrown">Hand-thrown pieces only</Label>
        </div>
      </Specimen>
      <Specimen label="Checked">
        <div className="flex items-center gap-2">
          <Checkbox id="cb-glaze-alert" defaultChecked />
          <Label htmlFor="cb-glaze-alert">
            Notify me when the sage glaze restocks
          </Label>
        </div>
      </Specimen>
      <Specimen label="Disabled">
        <div className="flex items-center gap-2">
          <Checkbox id="cb-kiln-full" disabled />
          <Label htmlFor="cb-kiln-full">Friday kiln slot (full)</Label>
        </div>
      </Specimen>
      <Specimen label="Disabled checked">
        <div className="flex items-center gap-2">
          <Checkbox id="cb-member" disabled defaultChecked />
          <Label htmlFor="cb-member">Studio member discount applied</Label>
        </div>
      </Specimen>
    </GallerySection>
    <GallerySection title="Workshop extras">
      <Specimen label="Addons">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Checkbox id="cb-apron" defaultChecked />
            <Label htmlFor="cb-apron">Keep the studio apron</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="cb-bisque" />
            <Label htmlFor="cb-bisque">Extra bisque firing</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="cb-gift" />
            <Label htmlFor="cb-gift">Gift wrap in kraft paper</Label>
          </div>
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
