import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { ContentPageForm } from "./ContentPageForm";

const heroField = (
  <div className="border border-ash p-4 text-[13px] text-muted-foreground">
    Hero image uploader
  </div>
);

const meta = {
  title: "Features/Admin/Content/ContentPageForm",
  component: ContentPageForm,
  parameters: { layout: "fullscreen" },
  args: {
    defaultValues: {
      title: "About",
      subtitle: "A small wheel studio in Sangli.",
      is_published: true,
      sections: [
        {
          heading: "The studio",
          body: "Two wheels, one kiln, and a shelf that is never quite full.",
          items: [],
        },
        {
          heading: "How a piece is made",
          body: "Four steps, all of them by hand.",
          items: [
            { title: "Wedge", body: "Air is worked out of the clay." },
            { title: "Throw", body: "The wall is pulled on the wheel." },
          ],
        },
      ],
    },
    savedLabel: "Last saved Fri, 12 Sep 2026, 4:20 pm",
    isSaving: false,
    heroField,
    onSubmit: () => {},
  },
} satisfies Meta<typeof ContentPageForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NewPage: Story = {
  args: {
    defaultValues: {
      title: "",
      subtitle: "",
      is_published: false,
      sections: [{ heading: "", body: "", items: [] }],
    },
    savedLabel: "Not saved yet",
  },
};

export const Saving: Story = {
  args: { isSaving: true },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
