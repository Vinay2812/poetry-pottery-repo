import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { UserProfile, type UserProfileProps } from "./UserProfile";

const base: UserProfileProps = {
  isLoading: false,
  isSignedIn: true,
  hasError: false,
  displayName: "Maya Iyer",
  initial: "M",
  email: "maya@example.com",
  roleLabel: "Member",
  isAdmin: false,
  memberSince: "March 2024",
  authProviderLabel: "Clerk",
  onSignInClick: vi.fn(),
};

function renderProfile(overrides: Partial<UserProfileProps> = {}) {
  return render(<UserProfile {...base} {...overrides} />);
}

describe("UserProfile", () => {
  it("renders the loaded profile", () => {
    renderProfile();

    expect(screen.getByText("Maya Iyer")).toBeInTheDocument();
    expect(screen.getByText("maya@example.com")).toBeInTheDocument();
    expect(screen.getByText("Member")).toBeInTheDocument();
    expect(
      screen.getByText(/Member since March 2024/, { exact: false }),
    ).toBeInTheDocument();
  });

  it("renders a busy skeleton while loading", () => {
    renderProfile({ isLoading: true });

    expect(screen.queryByText("Maya Iyer")).not.toBeInTheDocument();
    expect(document.querySelector('[aria-busy="true"]')).not.toBeNull();
  });

  it("invokes the sign-in callback when signed out", async () => {
    const onSignInClick = vi.fn();
    renderProfile({ isSignedIn: false, onSignInClick });

    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(onSignInClick).toHaveBeenCalledOnce();
  });

  it("renders an error state", () => {
    renderProfile({ hasError: true });

    expect(screen.getByText("Profile unavailable")).toBeInTheDocument();
  });

  it("marks admins with the admin badge", () => {
    renderProfile({ isAdmin: true, roleLabel: "Admin" });

    expect(screen.getByText("Admin")).toHaveClass("bg-terracotta");
  });
});
