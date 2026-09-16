import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";

import {
  clerkAppearance,
  clerkLocalization,
} from "@/components/providers/clerk-appearance";
import { Toaster } from "@/components/providers/toaster";
import { WebVitalsReporter } from "@/components/web-vitals-reporter";
import { ApolloProvider } from "@/lib/apollo";
import { fontVariables } from "@/lib/fonts";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Poetry & Pottery",
    template: "%s · Poetry & Pottery",
  },
  description:
    "Wheel-thrown stoneware made in Sangli, plus pottery workshops and open mic evenings at the studio.",
};

export const viewport: Viewport = {
  themeColor: "#f7f4ef",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider
      appearance={clerkAppearance}
      localization={clerkLocalization}
    >
      <html lang="en" className={`${fontVariables} h-full antialiased`}>
        <body className="flex min-h-full flex-col">
          <ApolloProvider>
            {children}
            <Toaster />
          </ApolloProvider>
          <WebVitalsReporter />
        </body>
      </html>
    </ClerkProvider>
  );
}
