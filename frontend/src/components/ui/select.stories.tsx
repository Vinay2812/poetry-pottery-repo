import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Gallery, GallerySection, Specimen } from "@/lib/storybook/gallery";
import { atViewport } from "@/lib/storybook/viewports";
import { Label } from "./label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

const meta = {
  title: "UI/Select",
  component: Select,
  parameters: { layout: "padded" },
  render: () => (
    <Gallery>
      <GallerySection title="Sizes">
        <Specimen label="Small">
          <div className="flex w-full flex-col gap-2 sm:w-56">
            <Label htmlFor="select-glaze-sm">Glaze</Label>
            <Select defaultValue="sage">
              <SelectTrigger id="select-glaze-sm" size="sm" className="w-full">
                <SelectValue placeholder="Choose a glaze" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sage">Sage ash</SelectItem>
                <SelectItem value="celadon">Celadon</SelectItem>
                <SelectItem value="shino">Shino</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Specimen>
        <Specimen label="Default">
          <div className="flex w-full flex-col gap-2 sm:w-56">
            <Label htmlFor="select-glaze-md">Glaze</Label>
            <Select defaultValue="celadon">
              <SelectTrigger id="select-glaze-md" className="w-full">
                <SelectValue placeholder="Choose a glaze" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sage">Sage ash</SelectItem>
                <SelectItem value="celadon">Celadon</SelectItem>
                <SelectItem value="shino">Shino</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Specimen>
      </GallerySection>
      <GallerySection title="States">
        <Specimen label="No selection">
          <div className="flex w-full flex-col gap-2 sm:w-56">
            <Label htmlFor="select-kiln-empty">Kiln</Label>
            <Select>
              <SelectTrigger id="select-kiln-empty" className="w-full">
                <SelectValue placeholder="Choose a kiln" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gas">Gas kiln</SelectItem>
                <SelectItem value="anagama">Wood-fired anagama</SelectItem>
                <SelectItem value="electric">Electric kiln</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Specimen>
        <Specimen label="Selected">
          <div className="flex w-full flex-col gap-2 sm:w-56">
            <Label htmlFor="select-kiln-filled">Kiln</Label>
            <Select defaultValue="anagama">
              <SelectTrigger id="select-kiln-filled" className="w-full">
                <SelectValue placeholder="Choose a kiln" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gas">Gas kiln</SelectItem>
                <SelectItem value="anagama">Wood-fired anagama</SelectItem>
                <SelectItem value="electric">Electric kiln</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Specimen>
        <Specimen label="Disabled">
          <div className="flex w-full flex-col gap-2 sm:w-56">
            <Label htmlFor="select-kiln-disabled">Kiln</Label>
            <Select defaultValue="gas" disabled>
              <SelectTrigger id="select-kiln-disabled" className="w-full">
                <SelectValue placeholder="Choose a kiln" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gas">Gas kiln</SelectItem>
                <SelectItem value="anagama">Wood-fired anagama</SelectItem>
                <SelectItem value="electric">Electric kiln</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Specimen>
      </GallerySection>
    </Gallery>
  ),
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };
