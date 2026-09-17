import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Gallery, GallerySection, Specimen } from "@/lib/storybook/gallery";
import { atViewport } from "@/lib/storybook/viewports";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

const SORT_OPTIONS = [
  { value: "FEATURED", label: "Featured" },
  { value: "NEWEST", label: "New arrivals" },
  { value: "PRICE_LOW_TO_HIGH", label: "Price: low to high" },
];

const gallery = (
  <Gallery>
    <GallerySection title="Shelf toolbar">
      <Specimen label="Closed">
        <Select defaultValue="FEATURED">
          <SelectTrigger aria-label="Sort by" className="h-10 bg-transparent">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Specimen>
      <Specimen label="A longer value">
        <Select defaultValue="PRICE_LOW_TO_HIGH">
          <SelectTrigger aria-label="Sort by" className="h-10 bg-transparent">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Specimen>
      <Specimen label="Disabled">
        <Select defaultValue="FEATURED" disabled>
          <SelectTrigger aria-label="Sort by" className="h-10 bg-transparent">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Specimen>
    </GallerySection>
  </Gallery>
);

const meta = {
  title: "UI/Select",
  component: Select,
  parameters: { layout: "padded" },
  render: () => gallery,
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };
