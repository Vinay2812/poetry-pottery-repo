import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Gallery, GallerySection, Specimen } from "@/lib/storybook/gallery";
import { atViewport } from "@/lib/storybook/viewports";
import { Separator } from "./separator";

const meta = {
  title: "UI/Separator",
  component: Separator,
  parameters: { layout: "padded" },
  render: () => (
    <Gallery>
      <GallerySection title="Orientations">
        <Specimen label="Horizontal">
          <div className="w-full sm:w-72">
            <p className="text-sm font-medium sm:text-base">Sage glaze mugs</p>
            <Separator className="my-4" />
            <p className="text-sm text-muted-foreground sm:text-base">
              Fired to cone 6 in the studio gas kiln.
            </p>
          </div>
        </Specimen>
        <Specimen label="Vertical">
          <div className="flex h-5 items-center gap-4 text-sm sm:text-base">
            <span>Wheel throwing</span>
            <Separator orientation="vertical" />
            <span>Glazing</span>
            <Separator orientation="vertical" />
            <span>Kiln firing</span>
          </div>
        </Specimen>
      </GallerySection>
      <GallerySection title="In context">
        <Specimen label="Card divider">
          <div className="w-full rounded-2xl bg-cream p-4 sm:w-72 sm:p-6">
            <p className="text-sm font-semibold sm:text-base">
              Weekend workshop
            </p>
            <p className="mt-1 text-sm text-neutral-600 sm:text-base">
              Beginner wheel throwing, aprons provided.
            </p>
            <Separator className="my-4" />
            <p className="text-sm text-neutral-600 sm:text-base">
              Saturday 10:00 — 8 seats left
            </p>
          </div>
        </Specimen>
        <Specimen label="Footer nav">
          <div className="flex h-5 items-center gap-4 text-sm text-muted-foreground sm:text-base">
            <span>Shop</span>
            <Separator orientation="vertical" />
            <span>Workshops</span>
            <Separator orientation="vertical" />
            <span>Studio visits</span>
          </div>
        </Specimen>
      </GallerySection>
    </Gallery>
  ),
} satisfies Meta<typeof Separator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };
