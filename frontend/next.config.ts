import type { NextConfig } from "next";

// Directives that cannot break Clerk or inline Next scripts; script-src needs nonces before it can be enforced.
const contentSecurityPolicy = [
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // Upload keys are unique per file, so an optimised copy never goes stale.
    minimumCacheTTL: 2_678_400,
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.poetryandpottery.prodapp.club" },
      { protocol: "https", hostname: "img.clerk.com" },
    ],
  },
  // Keeps winston resolved by Node at runtime instead of bundled.
  serverExternalPackages: ["winston"],
  turbopack: {
    resolveAlias: {
      winston: { browser: "./src/lib/logger/winston-browser-stub.ts" },
    },
  },
  headers() {
    return Promise.resolve([{ source: "/:path*", headers: securityHeaders }]);
  },
};

export default nextConfig;
