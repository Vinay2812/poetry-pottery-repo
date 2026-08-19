import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Gallery, GallerySection, Specimen } from "@/lib/storybook/gallery";
import { atViewport } from "@/lib/storybook/viewports";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const meta = {
  title: "UI/Tabs",
  component: Tabs,
  parameters: { layout: "padded" },
  render: () => (
    <Gallery>
      <GallerySection title="Variants">
        <Specimen label="Default">
          <Tabs defaultValue="glazes" className="w-full sm:w-96">
            <TabsList>
              <TabsTrigger value="glazes">Glazes</TabsTrigger>
              <TabsTrigger value="kilns">Kilns</TabsTrigger>
              <TabsTrigger value="workshops">Workshops</TabsTrigger>
            </TabsList>
            <TabsContent value="glazes">
              <p className="text-sm text-muted-foreground sm:text-base">
                Sage ash, celadon, and terracotta slips mixed in small batches.
              </p>
            </TabsContent>
            <TabsContent value="kilns">
              <p className="text-sm text-muted-foreground sm:text-base">
                One gas kiln and a wood-fired anagama behind the studio.
              </p>
            </TabsContent>
            <TabsContent value="workshops">
              <p className="text-sm text-muted-foreground sm:text-base">
                Weekend wheel throwing and weekday evening glazing classes.
              </p>
            </TabsContent>
          </Tabs>
        </Specimen>
        <Specimen label="Second tab active">
          <Tabs defaultValue="kilns" className="w-full sm:w-96">
            <TabsList>
              <TabsTrigger value="glazes">Glazes</TabsTrigger>
              <TabsTrigger value="kilns">Kilns</TabsTrigger>
              <TabsTrigger value="workshops">Workshops</TabsTrigger>
            </TabsList>
            <TabsContent value="glazes">
              <p className="text-sm text-muted-foreground sm:text-base">
                Sage ash, celadon, and terracotta slips mixed in small batches.
              </p>
            </TabsContent>
            <TabsContent value="kilns">
              <p className="text-sm text-muted-foreground sm:text-base">
                One gas kiln and a wood-fired anagama behind the studio.
              </p>
            </TabsContent>
            <TabsContent value="workshops">
              <p className="text-sm text-muted-foreground sm:text-base">
                Weekend wheel throwing and weekday evening glazing classes.
              </p>
            </TabsContent>
          </Tabs>
        </Specimen>
      </GallerySection>
      <GallerySection title="States">
        <Specimen label="Disabled tab">
          <Tabs defaultValue="glazes" className="w-full sm:w-96">
            <TabsList>
              <TabsTrigger value="glazes">Glazes</TabsTrigger>
              <TabsTrigger value="kilns">Kilns</TabsTrigger>
              <TabsTrigger value="raku" disabled>
                Raku (full)
              </TabsTrigger>
            </TabsList>
            <TabsContent value="glazes">
              <p className="text-sm text-muted-foreground sm:text-base">
                Sage ash, celadon, and terracotta slips mixed in small batches.
              </p>
            </TabsContent>
            <TabsContent value="kilns">
              <p className="text-sm text-muted-foreground sm:text-base">
                One gas kiln and a wood-fired anagama behind the studio.
              </p>
            </TabsContent>
            <TabsContent value="raku">
              <p className="text-sm text-muted-foreground sm:text-base">
                Raku firing weekend — currently waitlisted.
              </p>
            </TabsContent>
          </Tabs>
        </Specimen>
      </GallerySection>
    </Gallery>
  ),
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };
