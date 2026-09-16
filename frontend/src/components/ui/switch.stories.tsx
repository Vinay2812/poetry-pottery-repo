import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Gallery, GallerySection, Specimen } from "@/lib/storybook/gallery";
import { atViewport } from "@/lib/storybook/viewports";
import { Label } from "./label";
import { Switch } from "./switch";

const gallery = (
  <Gallery>
    <GallerySection title="Shelf filters">
      <Specimen label="Off">
        <div className="flex items-center gap-3">
          <Switch id="in-stock-only" />
          <Label htmlFor="in-stock-only">On the shelf now</Label>
        </div>
      </Specimen>
      <Specimen label="On">
        <div className="flex items-center gap-3">
          <Switch id="customizable-only" defaultChecked />
          <Label htmlFor="customizable-only">Can be customised</Label>
        </div>
      </Specimen>
      <Specimen label="Disabled">
        <div className="flex items-center gap-3">
          <Switch id="archive-only" disabled />
          <Label htmlFor="archive-only">Archive only</Label>
        </div>
      </Specimen>
    </GallerySection>
  </Gallery>
);

const meta = {
  title: "UI/Switch",
  component: Switch,
  parameters: { layout: "padded" },
  render: () => gallery,
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };
