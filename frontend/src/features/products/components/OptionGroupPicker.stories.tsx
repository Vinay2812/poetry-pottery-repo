import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { OptionGroupPicker } from "./OptionGroupPicker";

const meta = {
  title: "Features/Products/OptionGroupPicker",
  component: OptionGroupPicker,
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  args: {
    groupId: 1,
    name: "Glaze",
    kind: "CHOICE",
    isRequired: true,
    priceModifier: 0,
    maxLength: null,
    choices: [
      { id: 1, name: "Slate Grey", priceModifier: 0 },
      { id: 2, name: "Forest Green", priceModifier: 0 },
      { id: 3, name: "Blush Clay", priceModifier: 100 },
    ],
    selectedOptionId: 1,
    text: "",
    error: null,
    onSelectOption: fn(),
    onTextChange: fn(),
  },
} satisfies Meta<typeof OptionGroupPicker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Choice: Story = {};

export const ChoiceUnselected: Story = {
  args: { selectedOptionId: null },
};

export const ChoiceWithError: Story = {
  args: { selectedOptionId: null, error: "Choose a glaze" },
};

export const Text: Story = {
  args: {
    groupId: 2,
    name: "Carved initials",
    kind: "TEXT",
    isRequired: false,
    priceModifier: 150,
    maxLength: 12,
    text: "SM",
  },
};

export const TextWithError: Story = {
  args: {
    groupId: 2,
    name: "Carved initials",
    kind: "TEXT",
    isRequired: true,
    priceModifier: 150,
    maxLength: 12,
    text: "",
    error: "Add your carved initials",
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
