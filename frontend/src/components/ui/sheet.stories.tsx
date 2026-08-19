import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Gallery, GallerySection, Specimen } from "@/lib/storybook/gallery";
import { atViewport } from "@/lib/storybook/viewports";
import { Button } from "./button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";

const meta = {
  title: "UI/Sheet",
  component: Sheet,
  parameters: { layout: "padded" },
  render: () => (
    <Gallery>
      <GallerySection title="Sides">
        <Specimen label="Right (default)">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">View basket</Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Your basket</SheetTitle>
                <SheetDescription>
                  Hand-thrown pieces reserved from the latest kiln opening.
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </Specimen>
        <Specimen label="Left">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Workshop filters</Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Workshop filters</SheetTitle>
                <SheetDescription>
                  Narrow by level, glaze focus, or kiln type.
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </Specimen>
        <Specimen label="Top">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Studio notice</Button>
            </SheetTrigger>
            <SheetContent side="top">
              <SheetHeader>
                <SheetTitle>Kiln opening this Saturday</SheetTitle>
                <SheetDescription>
                  Come collect your cone 6 pieces from 10:00.
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </Specimen>
        <Specimen label="Bottom">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Glaze details</Button>
            </SheetTrigger>
            <SheetContent side="bottom">
              <SheetHeader>
                <SheetTitle>Sage ash glaze</SheetTitle>
                <SheetDescription>
                  Wood ash over a cream slip, fired to cone 6. Food safe.
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </Specimen>
      </GallerySection>
      <GallerySection title="Open">
        <Specimen label="Basket sheet, right side">
          <div className="min-h-96">
            <Sheet defaultOpen>
              <SheetTrigger asChild>
                <Button variant="outline">View basket</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Your basket</SheetTitle>
                  <SheetDescription>
                    Two hand-thrown pieces reserved from the latest kiln
                    opening.
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-3 px-4 text-sm">
                  <p>Speckled stoneware mug — sage glaze</p>
                  <p>Terracotta serving bowl — cream slip</p>
                </div>
                <SheetFooter>
                  <Button>Checkout</Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </Specimen>
      </GallerySection>
    </Gallery>
  ),
} satisfies Meta<typeof Sheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };
