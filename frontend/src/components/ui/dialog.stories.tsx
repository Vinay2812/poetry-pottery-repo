import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { Gallery, GallerySection, Specimen } from "@/lib/storybook/gallery";
import { atViewport } from "@/lib/storybook/viewports";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

const gallery = (
  <Gallery>
    <GallerySection title="Triggers">
      <Specimen label="Default trigger">
        <Dialog onOpenChange={fn()}>
          <DialogTrigger asChild>
            <Button>Reserve a seat</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reserve a seat</DialogTitle>
              <DialogDescription>
                Saturday morning wheel throwing, four seats left.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Specimen>
      <Specimen label="Outline trigger">
        <Dialog onOpenChange={fn()}>
          <DialogTrigger asChild>
            <Button variant="outline">Glaze care guide</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Glaze care guide</DialogTitle>
              <DialogDescription>
                Hand wash to keep the sage glaze bright for longer.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </Specimen>
      <Specimen label="Secondary trigger">
        <Dialog onOpenChange={fn()}>
          <DialogTrigger asChild>
            <Button variant="secondary">Kiln schedule</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Kiln schedule</DialogTitle>
              <DialogDescription>
                Bisque on Tuesdays, glaze firings on Fridays.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </Specimen>
    </GallerySection>
  </Gallery>
);

const meta = {
  title: "UI/Dialog",
  component: Dialog,
  parameters: { layout: "padded" },
  render: () => gallery,
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };
