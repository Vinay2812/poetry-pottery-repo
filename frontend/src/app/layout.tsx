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
import { DEFAULT_SHARE_IMAGE, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(clientEnv.NEXT_PUBLIC_SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  icons: {
    icon: [{ url: "/brand/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_IN",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_SHARE_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_SHARE_IMAGE.url],
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
