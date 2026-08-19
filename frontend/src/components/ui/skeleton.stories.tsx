import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Gallery, GallerySection, Specimen } from "@/lib/storybook/gallery";
import { atViewport } from "@/lib/storybook/viewports";
import { Skeleton } from "./skeleton";

const meta = {
  title: "UI/Skeleton",
  component: Skeleton,
  parameters: { layout: "padded" },
  render: () => (
    <Gallery>
      <GallerySection title="Shapes">
        <Specimen label="Text lines">
          <div className="flex w-full flex-col gap-2 sm:w-96">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-11/12" />
            <Skeleton className="h-5 w-4/5" />
          </div>
        </Specimen>
        <Specimen label="Avatar + text">
          <div className="flex w-full items-center gap-4 sm:w-72">
            <Skeleton className="size-12 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </Specimen>
      </GallerySection>
      <GallerySection title="Compositions">
        <Specimen label="Product card">
          <div className="flex w-full flex-col gap-3 sm:w-64">
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </Specimen>
        <Specimen label="Workshop row">
          <div className="flex w-full items-center gap-4 sm:w-96">
            <Skeleton className="aspect-square w-20 rounded-xl" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
        </Specimen>
      </GallerySection>
    </Gallery>
  ),
} satisfies Meta<typeof Skeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };
