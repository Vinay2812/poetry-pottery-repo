import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Gallery, GallerySection, Specimen } from "@/lib/storybook/gallery";
import { atViewport } from "@/lib/storybook/viewports";
import {
  BowlIcon,
  FireIcon,
  GlazeIcon,
  MugIcon,
  PlanterIcon,
  PlateIcon,
  PotteryIcon,
  ServingDishIcon,
  SmallThingsIcon,
  ThrowIcon,
  VaseIcon,
  WedgeIcon,
} from "./pottery";

const gallery = (
  <Gallery>
    <GallerySection title="Shapes">
      <Specimen label="Mug">
        <MugIcon />
      </Specimen>
      <Specimen label="Bowl">
        <BowlIcon />
      </Specimen>
      <Specimen label="Plate">
        <PlateIcon />
      </Specimen>
      <Specimen label="Vase">
        <VaseIcon />
      </Specimen>
      <Specimen label="Planter">
        <PlanterIcon />
      </Specimen>
      <Specimen label="Serving dish">
        <ServingDishIcon />
      </Specimen>
      <Specimen label="Small things">
        <SmallThingsIcon />
      </Specimen>
    </GallerySection>
    <GallerySection title="How a piece is made">
      <Specimen label="Wedge">
        <WedgeIcon />
      </Specimen>
      <Specimen label="Throw">
        <ThrowIcon />
      </Specimen>
      <Specimen label="Fire">
        <FireIcon />
      </Specimen>
      <Specimen label="Glaze">
        <GlazeIcon />
      </Specimen>
    </GallerySection>
    <GallerySection title="By kind">
      <Specimen label="Large">
        <PotteryIcon kind="vase" className="size-16" />
      </Specimen>
      <Specimen label="Small">
        <PotteryIcon kind="bowl" className="size-5" />
      </Specimen>
    </GallerySection>
  </Gallery>
);

const meta = {
  title: "Icons/Pottery",
  component: MugIcon,
  parameters: { layout: "padded" },
  render: () => gallery,
} satisfies Meta<typeof MugIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
