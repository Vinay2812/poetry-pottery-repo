import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { UserProfile } from "./UserProfile";

const ADMIN = {
  displayName: "Ravi Menon",
  initial: "R",
  email: "ravi@example.com",
  roleLabel: "Admin",
  isAdmin: true,
  memberSince: "January 2023",
};

const meta = {
  title: "Features/UserProfile",
  component: UserProfile,
  args: {
    isLoading: false,
    isSignedIn: true,
    hasError: false,
    displayName: "Maya Iyer",
    initial: "M",
    email: "maya@example.com",
    roleLabel: "Member",
    isAdmin: false,
    memberSince: "March 2024",
    onSignInClick: fn(),
  },
} satisfies Meta<typeof UserProfile>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Loaded: Story = {};

export const Loading: Story = { args: { isLoading: true } };

export const SignedOut: Story = { args: { isSignedIn: false } };

export const Admin: Story = { args: ADMIN };

export const Errored: Story = { args: { hasError: true } };

export const LoadedMobile: Story = { ...atViewport("mobile") };

export const LoadedTablet: Story = { ...atViewport("tablet") };

export const LoadedLaptop: Story = { ...atViewport("laptop") };

export const SignedOutMobile: Story = {
  args: { isSignedIn: false },
  ...atViewport("mobile"),
};

export const SignedOutTablet: Story = {
  args: { isSignedIn: false },
  ...atViewport("tablet"),
};

export const SignedOutLaptop: Story = {
  args: { isSignedIn: false },
  ...atViewport("laptop"),
};

export const AdminMobile: Story = { args: ADMIN, ...atViewport("mobile") };

export const AdminTablet: Story = { args: ADMIN, ...atViewport("tablet") };

export const AdminLaptop: Story = { args: ADMIN, ...atViewport("laptop") };

export const LoadingMobile: Story = {
  args: { isLoading: true },
  ...atViewport("mobile"),
};

export const LoadingTablet: Story = {
  args: { isLoading: true },
  ...atViewport("tablet"),
};

export const LoadingLaptop: Story = {
  args: { isLoading: true },
  ...atViewport("laptop"),
};
