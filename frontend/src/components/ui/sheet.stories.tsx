import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { Button } from "./button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "./sheet";

// The app only ever drives the sheet from a container, so the open panel is the state to prove.
const panel = (
  <Sheet open onOpenChange={fn()}>
    <SheetContent
      side="right"
      className="flex h-dvh w-full flex-col sm:max-w-sm"
    >
      <SheetHeader>
        <SheetTitle className="font-heading text-xl tracking-tight">
          Filters
        </SheetTitle>
        <SheetDescription>24 pieces on the shelf</SheetDescription>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto px-4 text-[15px] text-muted-foreground">
        Category, collection, glaze and price live here.
      </div>
      <SheetFooter>
        <Button>Show 24 pieces</Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
);

const meta = {
  title: "UI/Sheet",
  component: Sheet,
  parameters: { layout: "fullscreen" },
  render: () => panel,
} satisfies Meta<typeof Sheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };
