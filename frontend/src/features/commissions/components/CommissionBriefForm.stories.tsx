import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { CommissionBriefForm } from "./CommissionBriefForm";

const meta = {
  title: "Features/Commissions/CommissionBriefForm",
  component: CommissionBriefForm,
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
  args: {
    pieces: [
      {
        name: "Mugs",
        sizes: ["Espresso (30 ml)", "Short (150 ml)", "Tall (300 ml)"],
      },
      { name: "Bowls", sizes: [] },
      { name: "Plates", sizes: ["Side (18 cm)", "Dinner (26 cm)"] },
      { name: "Vases", sizes: [] },
    ],
    glazes: [
      { slug: "ocean-blue", name: "Ocean Blue", colorCode: "#2F5D7C" },
      { slug: "wood-fired", name: "Wood Fired", colorCode: "#7A5C3E" },
      { slug: "forest-green", name: "Forest Green", colorCode: "#588157" },
      { slug: "multan", name: "Multan", colorCode: null },
    ],
    isSubmitting: false,
    errorMessage: null,
    toAskUrl: (): string | null => "https://wa.me/919000000000?text=Hi",
    onSubmit: fn(),
  },
} satisfies Meta<typeof CommissionBriefForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Submitting: Story = { args: { isSubmitting: true } };

export const ServerRefused: Story = {
  args: { errorMessage: "We could not send that just now. Try again." },
};

export const WithoutWhatsApp: Story = { args: { toAskUrl: () => null } };

export const WithPhotoPicker: Story = {
  args: {
    photoPicker: (
      <p className="text-[13px] text-muted-foreground">
        Sign in to attach reference photos.
      </p>
    ),
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
