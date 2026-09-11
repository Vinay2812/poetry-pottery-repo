import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { MobileNav } from "./MobileNav";

const meta = {
  title: "Features/Layout/MobileNav",
  component: MobileNav,
  parameters: { layout: "fullscreen" },
  args: {
    activeHref: "/",
    cartCount: 0,
  },
} satisfies Meta<typeof MobileNav>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ActiveHome: Story = {};

export const ActiveShop: Story = { args: { activeHref: "/products" } };

export const ActiveWorkshops: Story = { args: { activeHref: "/workshops" } };

export const ActiveCart: Story = { args: { activeHref: "/cart" } };

export const WithCartCount: Story = { args: { cartCount: 12 } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
