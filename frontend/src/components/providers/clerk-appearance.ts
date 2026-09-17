import type { ClerkProvider } from "@clerk/nextjs";

// Clerk does not re-export its prop types from the Next entry point.
type ClerkProviderProps = Parameters<typeof ClerkProvider>[0];
type ClerkAppearance = ClerkProviderProps["appearance"];
type ClerkLocalization = ClerkProviderProps["localization"];

const isDevelopment = process.env.NODE_ENV === "development";

const INPUT =
  "h-11 rounded-none border border-ash bg-white px-2.5 text-[15px] text-ink shadow-none focus:border-sage focus:ring-1 focus:ring-sage";

export const clerkAppearance: ClerkAppearance = {
  options: {
    logoPlacement: "none",
    socialButtonsVariant: "blockButton",
    shimmer: false,
    unsafe_disableDevelopmentModeWarnings: isDevelopment,
  },
  variables: {
    colorPrimary: "#1f1d1a",
    colorPrimaryForeground: "#ffffff",
    colorBackground: "#f7f4ef",
    colorForeground: "#1f1d1a",
    colorMutedForeground: "#6f6a62",
    colorInput: "#ffffff",
    colorInputForeground: "#1f1d1a",
    colorBorder: "#e5e0d8",
    colorRing: "#4f6f52",
    colorDanger: "#a33a2c",
    colorSuccess: "#4f6f52",
    colorShadow: "transparent",
    colorModalBackdrop: "rgba(31, 29, 26, 0.45)",
    fontFamily: "var(--font-dm-sans)",
    fontFamilyButtons: "var(--font-dm-sans)",
    fontSize: "15px",
    borderRadius: "0",
  },
  elements: {
    cardBox: "rounded-none border border-ash shadow-none",
    card: "rounded-none bg-clay-white shadow-none",
    modalContent: "rounded-none shadow-none",
    modalCloseButton: "rounded-none text-smoke hover:bg-ash",
    header: "gap-1",
    headerTitle: "font-heading text-2xl font-normal tracking-tight text-ink",
    headerSubtitle: "text-[15px] text-smoke",
    socialButtonsBlockButton:
      "h-11 rounded-none border border-ash bg-white bg-none text-[15px] text-ink shadow-none hover:bg-ash",
    dividerLine: "bg-ash",
    dividerText: "text-[13px] text-smoke",
    formFieldLabel: "text-[13px] text-smoke",
    formFieldInput: INPUT,
    otpCodeFieldInput: "rounded-none border-ash text-ink",
    // bg-none strips Clerk's gradient overlay so the button is one flat ink.
    formButtonPrimary:
      "h-11 rounded-none bg-ink bg-none text-[15px] font-normal normal-case tracking-normal text-white shadow-none after:hidden hover:bg-ink/90",
    formButtonReset: "rounded-none text-ink hover:bg-ash",
    formResendCodeLink: "!text-sage",
    footer: "rounded-none border-t border-ash bg-clay-white shadow-none",
    // The "Secured by" row is the only thing left that names another product.
    footerItem: "hidden",
    footerAction: "bg-transparent",
    footerActionText: "text-[13px] text-smoke",
    footerActionLink: "text-[13px] !text-sage",
    identityPreview: "rounded-none border border-ash bg-white",
    // Clerk's own avatar radius wins on specificity, so the square trigger has to be important.
    userButtonAvatarBox: "!rounded-none",
    userButtonAvatarImage: "!rounded-none",
    userButtonPopoverCard: "rounded-none border border-ash shadow-none",
    userButtonPopoverActionButton: "rounded-none text-[15px] hover:bg-ash",
    navbarButton: "rounded-none",
    badge: "rounded-none",
    button: "rounded-none",
  },
};

// Clerk's own copy is title case and salesy; these are the only screens a customer sees.
export const clerkLocalization: ClerkLocalization = {
  signIn: {
    start: {
      title: "Sign in",
      subtitle: "Use the email you ordered with",
      titleCombined: "Sign in",
      subtitleCombined: "Use the email you ordered with",
    },
  },
  signUp: {
    start: {
      title: "Create an account",
      subtitle: "So your orders, saved pieces and bookings stay together",
    },
  },
};
