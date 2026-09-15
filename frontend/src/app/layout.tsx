import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";

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
  themeColor: "#fafaf9",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider>
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
