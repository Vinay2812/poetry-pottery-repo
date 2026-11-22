import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { TERMS_REQUIRED } from "@/lib/terms";
import { atViewport } from "@/lib/storybook/viewports";
import { TermsAgreement } from "./TermsAgreement";

const meta = {
  title: "Legal/TermsAgreement",
  component: TermsAgreement,
  parameters: { layout: "padded" },
  args: {
    id: "terms",
    isChecked: false,
    error: null,
    hasPaymentNote: true,
    onCheckedChange: fn(),
  },
} satisfies Meta<typeof TermsAgreement>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Ticked: Story = { args: { isChecked: true } };

export const Refused: Story = { args: { error: TERMS_REQUIRED } };

export const NothingToPay: Story = { args: { hasPaymentNote: false } };

export const Mobile: Story = {
  ...atViewport("mobile"),
  args: { error: TERMS_REQUIRED },
};

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
