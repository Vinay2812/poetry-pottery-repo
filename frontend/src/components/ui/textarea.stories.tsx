import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Gallery, GallerySection, Specimen } from "@/lib/storybook/gallery";
import { atViewport } from "@/lib/storybook/viewports";
import { Label } from "./label";
import { Textarea } from "./textarea";

const meta = {
  title: "UI/Textarea",
  component: Textarea,
  parameters: { layout: "padded" },
  render: () => (
    <Gallery>
      <GallerySection title="States">
        <Specimen label="Empty with placeholder">
          <div className="flex w-full flex-col gap-2 sm:w-96">
            <Label htmlFor="textarea-commission">Commission notes</Label>
            <Textarea
              id="textarea-commission"
              placeholder="Tell us about the piece you dream of throwing…"
            />
          </div>
        </Specimen>
        <Specimen label="Filled">
          <div className="flex w-full flex-col gap-2 sm:w-96">
            <Label htmlFor="textarea-commission-filled">Commission notes</Label>
            <Textarea
              id="textarea-commission-filled"
              defaultValue="A set of four dinner plates in sage glaze, with a raw clay rim."
            />
          </div>
        </Specimen>
        <Specimen label="Invalid">
          <div className="flex w-full flex-col gap-2 sm:w-96">
            <Label htmlFor="textarea-glaze-request">Glaze request</Label>
            <Textarea
              id="textarea-glaze-request"
              aria-invalid
              placeholder="Describe the glaze finish you need…"
            />
          </div>
        </Specimen>
        <Specimen label="Disabled">
          <div className="flex w-full flex-col gap-2 sm:w-96">
            <Label htmlFor="textarea-kiln-notes">Kiln notes</Label>
            <Textarea
              id="textarea-kiln-notes"
              disabled
              defaultValue="Cone 6 firing logged by the studio team."
            />
          </div>
        </Specimen>
      </GallerySection>
    </Gallery>
  ),
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };
