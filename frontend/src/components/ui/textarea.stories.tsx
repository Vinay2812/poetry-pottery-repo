import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Gallery, GallerySection, Specimen } from "@/lib/storybook/gallery";
import { atViewport } from "@/lib/storybook/viewports";
import { Label } from "./label";
import { Textarea } from "./textarea";

const gallery = (
  <Gallery>
    <GallerySection title="Notes to the studio">
      <Specimen label="Empty">
        <div className="flex w-full flex-col gap-1.5 sm:w-72">
          <Label htmlFor="order-note">Anything we should know?</Label>
          <Textarea id="order-note" rows={3} placeholder="Optional" />
        </div>
      </Specimen>
      <Specimen label="Filled">
        <div className="flex w-full flex-col gap-1.5 sm:w-72">
          <Label htmlFor="booking-note">Anything we should know?</Label>
          <Textarea
            id="booking-note"
            rows={3}
            defaultValue="Two of us are left handed, if that changes the wheel setup."
          />
        </div>
      </Specimen>
      <Specimen label="Disabled">
        <div className="flex w-full flex-col gap-1.5 sm:w-72">
          <Label htmlFor="sent-note">Anything we should know?</Label>
          <Textarea
            id="sent-note"
            rows={3}
            defaultValue="Please wrap it as a gift."
            disabled
          />
        </div>
      </Specimen>
    </GallerySection>
    <GallerySection title="Cancellation reason">
      <Specimen label="Invalid">
        <div className="flex w-full flex-col gap-1.5 sm:w-72">
          <Label htmlFor="cancel-reason">Why are you cancelling?</Label>
          <Textarea id="cancel-reason" rows={2} aria-invalid />
          <p role="alert" className="text-[13px] text-destructive">
            Tell us a little so we can free the wheel
          </p>
        </div>
      </Specimen>
    </GallerySection>
  </Gallery>
);

const meta = {
  title: "UI/Textarea",
  component: Textarea,
  parameters: { layout: "padded" },
  render: () => gallery,
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };
