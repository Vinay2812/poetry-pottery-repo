import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { SearchPanel } from "./SearchPanel";

const PIECES = [
  {
    key: "p1",
    label: "Slate morning mug",
    note: "₹850",
    imageUrl:
      "https://images.pexels.com/photos/18426654/pexels-photo-18426654.jpeg",
  },
  {
    key: "p2",
    label: "Ash glaze bowl",
    note: "₹600",
    imageUrl:
      "https://images.pexels.com/photos/8951881/pexels-photo-8951881.jpeg",
  },
  {
    key: "p3",
    label: "Kulhad, unglazed",
    note: "In the archive",
    imageUrl: null,
  },
  {
    key: "p4",
    label: "Wood-fired serving dish",
    note: "₹2,400",
    imageUrl:
      "https://images.pexels.com/photos/15028227/pexels-photo-15028227.jpeg",
  },
];

const meta = {
  title: "Features/Search/SearchPanel",
  component: SearchPanel,
  parameters: { layout: "fullscreen" },
  args: {
    panelId: "search",
    value: "mug",
    activeIndex: -1,
    isLoading: false,
    recents: [
      { key: "r1", label: "sage green", note: null },
      { key: "r2", label: "kulhad", note: null },
    ],
    pieces: PIECES,
    events: [
      { key: "e1", label: "Open mic evening", note: "Sat, 4 Oct 2026" },
      { key: "e2", label: "Glazing workshop", note: "Sun, 12 Oct 2026" },
    ],
    workshops: [
      {
        key: "w1",
        label: "Open studio wheel session",
        note: "Book an hour at the wheel",
      },
    ],
    onChange: fn(),
    onSubmit: fn(),
    onSelectIndex: fn(),
    onHoverIndex: fn(),
    onKeyDown: fn(),
    onClose: fn(),
    onClearRecents: fn(),
  },
} satisfies Meta<typeof SearchPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithSuggestions: Story = {};

export const RecentsOnly: Story = {
  args: { value: "", pieces: [], events: [], workshops: [] },
};

export const FirstPieceHighlighted: Story = { args: { activeIndex: 2 } };

export const NothingYet: Story = {
  args: {
    value: "",
    recents: [],
    pieces: [],
    events: [],
    workshops: [],
  },
};

export const Loading: Story = { args: { isLoading: true } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
