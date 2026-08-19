import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Gallery, GallerySection, Specimen } from "@/lib/storybook/gallery";
import { atViewport } from "@/lib/storybook/viewports";
import { Button } from "./button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

const gallery = (
  <Gallery>
    <GallerySection title="Layouts">
      <Specimen label="Default">
        <Card className="w-full sm:max-w-sm">
          <CardHeader>
            <CardTitle>Speckled stoneware mug</CardTitle>
            <CardDescription>Wheel thrown, glazed in sage.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground sm:text-base">
              Each piece is finished by hand, so no two mugs are quite alike.
            </p>
          </CardContent>
          <CardFooter>
            <Button>Add to basket</Button>
          </CardFooter>
        </Card>
      </Specimen>
      <Specimen label="Compact">
        <Card className="w-full gap-3 py-4 sm:max-w-xs">
          <CardHeader>
            <CardTitle>Glaze notes</CardTitle>
            <CardDescription>Sage over cream slip.</CardDescription>
          </CardHeader>
        </Card>
      </Specimen>
    </GallerySection>
    <GallerySection title="Content only">
      <Specimen label="No footer">
        <Card className="w-full sm:max-w-sm">
          <CardHeader>
            <CardTitle>Saturday wheel throwing</CardTitle>
            <CardDescription>
              Beginner friendly, aprons provided.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground sm:text-base">
              Two hours on the wheel with all clay, tools, and a bisque firing
              included.
            </p>
          </CardContent>
        </Card>
      </Specimen>
    </GallerySection>
  </Gallery>
);

const meta = {
  title: "UI/Card",
  component: Card,
  parameters: { layout: "padded" },
  render: () => gallery,
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };
