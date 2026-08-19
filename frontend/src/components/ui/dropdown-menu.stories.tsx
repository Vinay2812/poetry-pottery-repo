import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { Gallery, GallerySection, Specimen } from "@/lib/storybook/gallery";
import { atViewport } from "@/lib/storybook/viewports";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

const gallery = (
  <Gallery>
    <GallerySection title="Triggers">
      <Specimen label="Outline trigger">
        <DropdownMenu onOpenChange={fn()}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Glaze options</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Stoneware mug</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Add to basket</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Specimen>
      <Specimen label="Default trigger">
        <DropdownMenu onOpenChange={fn()}>
          <DropdownMenuTrigger asChild>
            <Button>Filter firings</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Kiln type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Electric kiln</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Specimen>
      <Specimen label="Ghost trigger">
        <DropdownMenu onOpenChange={fn()}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">Sort workshops</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem>By date</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Specimen>
    </GallerySection>
  </Gallery>
);

const meta = {
  title: "UI/DropdownMenu",
  component: DropdownMenu,
  parameters: { layout: "padded" },
  render: () => gallery,
} satisfies Meta<typeof DropdownMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };
