import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Gallery, GallerySection, Specimen } from "@/lib/storybook/gallery";
import { atViewport } from "@/lib/storybook/viewports";
import { CategoryPiece } from "./CategoryPiece";

const SHELF = [
  { slug: "mugs", label: "Mugs" },
  { slug: "bowls", label: "Bowls" },
  { slug: "plates", label: "Plates" },
  { slug: "vases", label: "Vases" },
  { slug: "planters", label: "Planters" },
  { slug: "serveware", label: "Serveware" },
  { slug: "accessories", label: "Accessories" },
  { slug: "wood-fired", label: "Wood Fired" },
];

const gallery = (
  <Gallery>
    <GallerySection title="A piece per category">
      {SHELF.map((category) => (
        <Specimen key={category.slug} label={category.label}>
          <CategoryPiece slug={category.slug} className="size-20" />
        </Specimen>
      ))}
    </GallerySection>
    <GallerySection title="A slug with no piece of its own">
      <Specimen label="Gift cards">
        <CategoryPiece slug="gift-cards" className="size-20" />
      </Specimen>
    </GallerySection>
    <GallerySection title="The sizes a tile uses">
      <Specimen label="64px">
        <CategoryPiece slug="bowls" className="size-16" />
      </Specimen>
      <Specimen label="80px">
        <CategoryPiece slug="bowls" className="size-20" />
      </Specimen>
    </GallerySection>
  </Gallery>
);

const meta = {
  title: "Media/CategoryPiece",
  component: CategoryPiece,
  parameters: { layout: "padded" },
  args: { slug: "mugs" },
  render: () => gallery,
} satisfies Meta<typeof CategoryPiece>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };

/** One piece large, so the hatching and the glaze can be judged. */
export const Large: Story = {
  args: { slug: "wood-fired" },
  render: () => (
    <div className="flex gap-6">
      <CategoryPiece slug="wood-fired" className="size-64" />
      <CategoryPiece slug="accessories" className="size-64" />
    </div>
  ),
};
