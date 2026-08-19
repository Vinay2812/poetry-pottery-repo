import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Flame, Heart, ShoppingBasket } from "lucide-react";

import { Gallery, GallerySection, Specimen } from "@/lib/storybook/gallery";
import { atViewport } from "@/lib/storybook/viewports";
import { Button } from "./button";

const gallery = (
  <Gallery>
    <GallerySection title="Variants">
      <Specimen label="Default">
        <Button>Add to basket</Button>
      </Specimen>
      <Specimen label="Secondary">
        <Button variant="secondary">Browse glazes</Button>
      </Specimen>
      <Specimen label="Outline">
        <Button variant="outline">Reserve a seat</Button>
      </Specimen>
      <Specimen label="Ghost">
        <Button variant="ghost">View kiln notes</Button>
      </Specimen>
      <Specimen label="Destructive">
        <Button variant="destructive">Cancel workshop</Button>
      </Specimen>
      <Specimen label="Link">
        <Button variant="link">Read our story</Button>
      </Specimen>
    </GallerySection>
    <GallerySection title="Sizes">
      <Specimen label="Small">
        <Button size="sm">Small batch</Button>
      </Specimen>
      <Specimen label="Default">
        <Button>Default firing</Button>
      </Specimen>
      <Specimen label="Large">
        <Button size="lg">Book the wheel</Button>
      </Specimen>
      <Specimen label="Extra large">
        <Button size="xl">Join the studio</Button>
      </Specimen>
    </GallerySection>
    <GallerySection title="Icon sizes">
      <Specimen label="Icon small">
        <Button size="icon-sm" aria-label="Add to wishlist">
          <Heart />
        </Button>
      </Specimen>
      <Specimen label="Icon">
        <Button size="icon" aria-label="Add to basket">
          <ShoppingBasket />
        </Button>
      </Specimen>
      <Specimen label="Icon large">
        <Button size="icon-lg" aria-label="View kiln schedule">
          <Flame />
        </Button>
      </Specimen>
    </GallerySection>
    <GallerySection title="States">
      <Specimen label="With icon">
        <Button>
          <ShoppingBasket />
          Add to basket
        </Button>
      </Specimen>
      <Specimen label="Disabled">
        <Button disabled>Kiln full</Button>
      </Specimen>
      <Specimen label="Disabled outline">
        <Button variant="outline" disabled>
          Workshop sold out
        </Button>
      </Specimen>
    </GallerySection>
  </Gallery>
);

const meta = {
  title: "UI/Button",
  component: Button,
  parameters: { layout: "padded" },
  render: () => gallery,
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };
