import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { AdminEmptyRow } from "./AdminEmptyRow";
import {
  ADMIN_TD,
  ADMIN_TH,
  ADMIN_TR,
  AdminTableFrame,
} from "./AdminTableFrame";

const ROWS = [
  { id: 1, name: "Slate morning mug", price: "₹1,200", stock: "8 left" },
  { id: 2, name: "Ash rim bowl", price: "₹1,850", stock: "2 left" },
  { id: 3, name: "Terracotta planter", price: "₹2,400", stock: "Sold out" },
];

function Rows() {
  return (
    <>
      <thead>
        <tr>
          <th className={ADMIN_TH}>Piece</th>
          <th className={ADMIN_TH}>Price</th>
          <th className={ADMIN_TH}>Stock</th>
        </tr>
      </thead>
      <tbody>
        {ROWS.map((row) => (
          <tr key={row.id} className={ADMIN_TR}>
            <td className={ADMIN_TD}>{row.name}</td>
            <td className={`${ADMIN_TD} tnum`}>{row.price}</td>
            <td className={ADMIN_TD}>{row.stock}</td>
          </tr>
        ))}
      </tbody>
    </>
  );
}

const meta = {
  title: "Features/Admin/AdminTableFrame",
  component: AdminTableFrame,
  decorators: [
    (Story) => (
      <div className="w-full max-w-3xl">
        <Story />
      </div>
    ),
  ],
  args: {
    caption: "Pieces on the shelf",
    isBusy: false,
    children: <Rows />,
  },
} satisfies Meta<typeof AdminTableFrame>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Busy: Story = { args: { isBusy: true } };

export const Empty: Story = {
  args: {
    children: (
      <>
        <thead>
          <tr>
            <th className={ADMIN_TH}>Piece</th>
            <th className={ADMIN_TH}>Price</th>
            <th className={ADMIN_TH}>Stock</th>
          </tr>
        </thead>
        <tbody>
          <AdminEmptyRow colSpan={3} message="No pieces match those filters" />
        </tbody>
      </>
    ),
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
