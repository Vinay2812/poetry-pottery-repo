import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";

import {
  clerkAppearance,
  clerkLocalization,
} from "@/components/providers/clerk-appearance";
import { Toaster } from "@/components/providers/toaster";
import { WebVitalsReporter } from "@/components/web-vitals-reporter";
import { clientEnv } from "@/config/env";
import { ApolloProvider } from "@/lib/apollo";
import { fontVariables } from "@/lib/fonts";

import "./globals.css";

const description =
  "Wheel-thrown stoneware made in Sangli, plus pottery workshops and open mic evenings at the studio.";

export const metadata: Metadata = {
  metadataBase: new URL(clientEnv.NEXT_PUBLIC_SITE_URL),
  title: {
    default: "Poetry & Pottery",
    template: "%s · Poetry & Pottery",
  },
  description,
  icons: {
    icon: [{ url: "/brand/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    siteName: "Poetry & Pottery",
    title: "Poetry & Pottery",
    description,
    images: [
      {
        url: "/brand/og-image.png",
        width: 1200,
        height: 630,
        alt: "Poetry & Pottery",
      },
    ],
  },
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
