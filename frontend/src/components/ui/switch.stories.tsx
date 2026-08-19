import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Gallery, GallerySection, Specimen } from "@/lib/storybook/gallery";
import { atViewport } from "@/lib/storybook/viewports";
import { Label } from "./label";
import { Switch } from "./switch";

const meta = {
  title: "UI/Switch",
  component: Switch,
  parameters: { layout: "padded" },
  render: () => (
    <Gallery>
      <GallerySection title="States">
        <Specimen label="On">
          <div className="flex items-center gap-3">
            <Switch id="switch-kiln-alerts" defaultChecked />
            <Label htmlFor="switch-kiln-alerts">Kiln opening alerts</Label>
          </div>
        </Specimen>
        <Specimen label="Off">
          <div className="flex items-center gap-3">
            <Switch id="switch-workshop-reminders" />
            <Label htmlFor="switch-workshop-reminders">
              Workshop reminders
            </Label>
          </div>
        </Specimen>
        <Specimen label="Disabled">
          <div className="flex items-center gap-3">
            <Switch id="switch-glaze-drop" disabled />
            <Label htmlFor="switch-glaze-drop">Glaze drop notifications</Label>
          </div>
        </Specimen>
      </GallerySection>
      <GallerySection title="In context">
        <Specimen label="Studio preferences">
          <div className="flex w-full flex-col gap-4 rounded-2xl bg-cream p-4 sm:w-72 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="switch-newsletter">Monthly newsletter</Label>
              <Switch id="switch-newsletter" defaultChecked />
            </div>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="switch-seconds">Seconds sale alerts</Label>
              <Switch id="switch-seconds" />
            </div>
          </div>
        </Specimen>
      </GallerySection>
    </Gallery>
  ),
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };
