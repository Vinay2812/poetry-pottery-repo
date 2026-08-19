import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";

import { WebVitalsReporter } from "@/components/web-vitals-reporter";
import { ToastContainer } from "@/features/notifications";
import { ApolloProvider } from "@/lib/apollo";
import { fontVariables } from "@/lib/fonts";

import "./globals.css";

export const metadata: Metadata = {
  title: "Poetry & Pottery",
  description: "Handcrafted pottery e-commerce and pottery workshops",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${fontVariables} h-full antialiased`}>
        <body className="flex min-h-full flex-col">
          <ApolloProvider>
            {children}
            <ToastContainer />
          </ApolloProvider>
          <WebVitalsReporter />
        </body>
      </html>
    </ClerkProvider>
  );
}
