import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Input } from "@/components/ui/input";
import { atViewport } from "@/lib/storybook/viewports";
import { AdminField } from "./AdminField";
import { AdminFormSection } from "./AdminFormSection";

const meta = {
  title: "Features/Admin/AdminFormSection",
  component: AdminFormSection,
  args: {
    title: "Price and stock",
    description: "What a buyer pays, in whole rupees.",
    children: (
      <AdminField id="story-price" label="Price" hint={null} error={undefined}>
        <Input id="story-price" type="number" defaultValue={1200} />
      </AdminField>
    ),
  },
} satisfies Meta<typeof AdminFormSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithADescription: Story = {};

export const TitleOnly: Story = { args: { description: null } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
