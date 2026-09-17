import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { EventType } from "@/graphql/generated/graphql";
import { atViewport } from "@/lib/storybook/viewports";

import { EMPTY_EVENT_FORM } from "@/features/admin/events/types";

import { EventForm } from "./EventForm";

const WORKSHOP = {
  ...EMPTY_EVENT_FORM,
  title: "Wheel evening",
  description: "Three hours at the wheel, clay and tea included.",
  starts_at: "2026-10-03T17:00",
  ends_at: "2026-10-03T20:00",
  location: "Studio, Sangli",
  address: "12 Kiln Lane, Sangli",
  price: 1200,
  total_seats: 8,
  instructor: "Meera",
  image_url: "https://images.unsplash.com/photo-1565193298357-c5b46b0d0b0a",
  highlights: "Clay included\nSmall group",
  includes: "Tea",
};

function coverStub(value: string) {
  return (
    <p className="border border-ash p-3 text-[13px] text-muted-foreground">
      {value ? "Cover photo chosen" : "No cover photo yet"}
    </p>
  );
}

function galleryStub(urls: string[]) {
  return (
    <p className="border border-ash p-3 text-[13px] text-muted-foreground">
      {urls.length} gallery photos
    </p>
  );
}

const meta = {
  title: "Features/Admin/Events/EventForm",
  component: EventForm,
  parameters: { layout: "padded" },
  args: {
    defaultValues: WORKSHOP,
    isSubmitting: false,
    submitLabel: "Save changes",
    renderCoverField: coverStub,
    renderGalleryField: galleryStub,
    onSubmit: () => {},
  },
} satisfies Meta<typeof EventForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Workshop: Story = {};

export const OpenMic: Story = {
  args: {
    defaultValues: {
      ...WORKSHOP,
      event_type: EventType.OpenMic,
      title: "Open mic under the neem",
      performers: "Asha\nRohan",
    },
  },
};

export const NewEvent: Story = {
  args: { defaultValues: EMPTY_EVENT_FORM, submitLabel: "Create event" },
};

export const Saving: Story = { args: { isSubmitting: true } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
