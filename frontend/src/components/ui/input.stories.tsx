import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Gallery, GallerySection, Specimen } from "@/lib/storybook/gallery";
import { atViewport } from "@/lib/storybook/viewports";
import { Input } from "./input";
import { Label } from "./label";

const gallery = (
  <Gallery>
    <GallerySection title="Address fields">
      <Specimen label="Empty">
        <div className="flex w-full flex-col gap-1.5 sm:w-64">
          <Label htmlFor="line1">Address line 1</Label>
          <Input id="line1" autoComplete="address-line1" />
        </div>
      </Specimen>
      <Specimen label="Filled">
        <div className="flex w-full flex-col gap-1.5 sm:w-64">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            defaultValue="Bengaluru"
            autoComplete="address-level2"
          />
        </div>
      </Specimen>
      <Specimen label="Invalid">
        <div className="flex w-full flex-col gap-1.5 sm:w-64">
          <Label htmlFor="pincode">Pincode</Label>
          <Input id="pincode" defaultValue="5600" aria-invalid />
          <p role="alert" className="text-[13px] text-destructive">
            Pincode must be 6 digits
          </p>
        </div>
      </Specimen>
      <Specimen label="Disabled">
        <div className="flex w-full flex-col gap-1.5 sm:w-64">
          <Label htmlFor="state">State</Label>
          <Input id="state" defaultValue="Karnataka" disabled />
        </div>
      </Specimen>
    </GallerySection>
    <GallerySection title="Coupon and newsletter">
      <Specimen label="Coupon code">
        <div className="flex w-full flex-col gap-1.5 sm:w-64">
          <Label htmlFor="coupon">Coupon code</Label>
          <Input id="coupon" placeholder="KILN10" />
        </div>
      </Specimen>
      <Specimen label="Email">
        <div className="flex w-full flex-col gap-1.5 sm:w-64">
          <Label htmlFor="newsletter-email">Email</Label>
          <Input
            id="newsletter-email"
            type="email"
            placeholder="you@example.com"
          />
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
