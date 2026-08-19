import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Gallery, GallerySection, Specimen } from "@/lib/storybook/gallery";
import { atViewport } from "@/lib/storybook/viewports";
import { Input } from "./input";
import { Label } from "./label";

const gallery = (
  <Gallery>
    <GallerySection title="States">
      <Specimen label="Default">
        <div className="flex w-full flex-col gap-2 sm:w-72">
          <Label htmlFor="input-email">Email for order updates</Label>
          <Input id="input-email" placeholder="you@example.com" />
        </div>
      </Specimen>
      <Specimen label="Filled">
        <div className="flex w-full flex-col gap-2 sm:w-72">
          <Label htmlFor="input-name">Name for the workshop</Label>
          <Input id="input-name" defaultValue="Aisha Potter" />
        </div>
      </Specimen>
      <Specimen label="Disabled">
        <div className="flex w-full flex-col gap-2 sm:w-72">
          <Label htmlFor="input-slot">Kiln firing slot</Label>
          <Input id="input-slot" placeholder="Friday glaze firing" disabled />
        </div>
      </Specimen>
      <Specimen label="Invalid">
        <div className="flex w-full flex-col gap-2 sm:w-72">
          <Label htmlFor="input-pin">Delivery PIN code</Label>
          <Input
            id="input-pin"
            defaultValue="5600"
            aria-invalid={true}
            aria-describedby="input-pin-error"
          />
          <p id="input-pin-error" className="text-xs text-red-600">
            PIN code must be 6 digits.
          </p>
        </div>
      </Specimen>
    </GallerySection>
    <GallerySection title="Types">
      <Specimen label="Search">
        <div className="flex w-full flex-col gap-2 sm:w-72">
          <Label htmlFor="input-search">Search the shop</Label>
          <Input id="input-search" type="search" placeholder="Sage mug…" />
        </div>
      </Specimen>
      <Specimen label="Number">
        <div className="flex w-full flex-col gap-2 sm:w-72">
          <Label htmlFor="input-seats">Workshop seats</Label>
          <Input
            id="input-seats"
            type="number"
            min={1}
            max={8}
            defaultValue={2}
          />
        </div>
      </Specimen>
      <Specimen label="Password">
        <div className="flex w-full flex-col gap-2 sm:w-72">
          <Label htmlFor="input-password">Studio account password</Label>
          <Input id="input-password" type="password" placeholder="••••••••" />
        </div>
      </Specimen>
    </GallerySection>
  </Gallery>
);

const meta = {
  title: "UI/Input",
  component: Input,
  parameters: { layout: "padded" },
  render: () => gallery,
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };
