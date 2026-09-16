import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Gallery, GallerySection, Specimen } from "@/lib/storybook/gallery";
import { atViewport } from "@/lib/storybook/viewports";
import { Checkbox } from "./checkbox";
import { Input } from "./input";
import { Label } from "./label";
import { Textarea } from "./textarea";

const gallery = (
  <Gallery>
    <GallerySection title="Above a field">
      <Specimen label="With an input">
        <div className="flex w-full flex-col gap-1.5 sm:w-64">
          <Label htmlFor="guest-name">Name</Label>
          <Input id="guest-name" defaultValue="Maya Iyer" />
        </div>
      </Specimen>
      <Specimen label="With a textarea">
        <div className="flex w-full flex-col gap-1.5 sm:w-64">
          <Label htmlFor="order-note">Note for the studio</Label>
          <Textarea id="order-note" rows={2} />
        </div>
      </Specimen>
    </GallerySection>
    <GallerySection title="Beside a control">
      <Specimen label="With a checkbox">
        <div className="flex items-center gap-3">
          <Checkbox id="in-stock" defaultChecked />
          <Label htmlFor="in-stock">On the shelf now</Label>
        </div>
      </Specimen>
      <Specimen label="Dimmed with its control">
        <div className="group flex items-center gap-3" data-disabled="true">
          <Checkbox id="made-to-order" disabled />
          <Label htmlFor="made-to-order">Made to order</Label>
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
