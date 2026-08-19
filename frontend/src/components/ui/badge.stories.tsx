import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Gallery, GallerySection, Specimen } from "@/lib/storybook/gallery";
import { atViewport } from "@/lib/storybook/viewports";
import { Badge } from "./badge";

const gallery = (
  <Gallery>
    <GallerySection title="Variants">
      <Specimen label="Default">
        <Badge>Hand thrown</Badge>
      </Specimen>
      <Specimen label="Primary">
        <Badge variant="primary">Sage glaze</Badge>
      </Specimen>
      <Specimen label="Secondary">
        <Badge variant="secondary">Stoneware</Badge>
      </Specimen>
      <Specimen label="Success">
        <Badge variant="success">In stock</Badge>
      </Specimen>
      <Specimen label="Warning">
        <Badge variant="warning">Only 2 left</Badge>
      </Specimen>
      <Specimen label="Error">
        <Badge variant="error">Kiln delay</Badge>
      </Specimen>
      <Specimen label="Destructive">
        <Badge variant="destructive">Sold out</Badge>
      </Specimen>
      <Specimen label="Info">
        <Badge variant="info">New glaze</Badge>
      </Specimen>
      <Specimen label="Outline">
        <Badge variant="outline">Workshop</Badge>
      </Specimen>
    </GallerySection>
    <GallerySection title="Sizes">
      <Specimen label="Small">
        <Badge size="sm" variant="primary">
          Cone 6
        </Badge>
      </Specimen>
      <Specimen label="Default">
        <Badge variant="primary">Cone 6</Badge>
      </Specimen>
      <Specimen label="Large">
        <Badge size="lg" variant="primary">
          Cone 6
        </Badge>
      </Specimen>
    </GallerySection>
  </Gallery>
);

const meta = {
  title: "UI/Badge",
  component: Badge,
  parameters: { layout: "padded" },
  render: () => gallery,
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };
