import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Gallery, GallerySection, Specimen } from "@/lib/storybook/gallery";
import { atViewport } from "@/lib/storybook/viewports";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

const meta = {
  title: "UI/Table",
  component: Table,
  parameters: { layout: "padded" },
  render: () => (
    <Gallery>
      <GallerySection title="Variants">
        <Specimen label="Product table with header and footer">
          <Table className="w-full">
            <TableCaption>Current pieces in the studio shop.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Piece</TableHead>
                <TableHead>Glaze</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Stoneware mug</TableCell>
                <TableCell>Sage ash</TableCell>
                <TableCell className="text-right">₹1,200</TableCell>
                <TableCell className="text-right">12</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Serving bowl</TableCell>
                <TableCell>Terracotta slip</TableCell>
                <TableCell className="text-right">₹2,400</TableCell>
                <TableCell className="text-right">7</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Dinner plate</TableCell>
                <TableCell>Celadon</TableCell>
                <TableCell className="text-right">₹1,800</TableCell>
                <TableCell className="text-right">3</TableCell>
              </TableRow>
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3}>Total pieces</TableCell>
                <TableCell className="text-right">22</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </Specimen>
      </GallerySection>
      <GallerySection title="States">
        <Specimen label="Selected row">
          <Table className="w-full">
            <TableCaption>Saturday wheel throwing roster.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Level</TableHead>
                <TableHead className="text-right">Seat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow data-state="selected">
                <TableCell>Ana</TableCell>
                <TableCell>Beginner</TableCell>
                <TableCell className="text-right">3</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Ravi</TableCell>
                <TableCell>Intermediate</TableCell>
                <TableCell className="text-right">5</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Specimen>
      </GallerySection>
    </Gallery>
  ),
} satisfies Meta<typeof Table>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };
