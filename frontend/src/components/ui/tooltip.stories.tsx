import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Gallery, GallerySection, Specimen } from "@/lib/storybook/gallery";
import { atViewport } from "@/lib/storybook/viewports";
import { Button } from "./button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

const meta = {
  title: "UI/Tooltip",
  component: Tooltip,
  parameters: { layout: "padded" },
  render: () => (
    <TooltipProvider>
      <Gallery>
        <GallerySection title="Triggers">
          <Specimen label="Closed, firing info">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Cone 6 firing</Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>About 2232°F — stoneware vitrifies here.</p>
              </TooltipContent>
            </Tooltip>
          </Specimen>
          <Specimen label="Closed, workshop hint">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Raku weekend</Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Waitlisted — next firing in spring.</p>
              </TooltipContent>
            </Tooltip>
          </Specimen>
        </GallerySection>
        <GallerySection title="Open">
          <Specimen label="Open below the trigger">
            <div className="flex min-h-24 items-start">
              <Tooltip defaultOpen>
                <TooltipTrigger asChild>
                  <Button variant="outline">Glaze firing</Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Pieces ready after a slow 36-hour cool.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </Specimen>
        </GallerySection>
      </Gallery>
    </TooltipProvider>
  ),
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };
