import type { NextConfig } from "next";
import path from "node:path";

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: { root: path.resolve(process.cwd()) },
  outputFileTracingRoot: path.resolve(process.cwd()),
  images: { remotePatterns: [{ protocol: "https", hostname: "s1.ticketm.net" }, { protocol: "https", hostname: "s1.ticketmaster.com" }], formats: ["image/avif", "image/webp"] },
  headers: async () => [{ source: "/(.*)", headers: [{ key: "X-Content-Type-Options", value: "nosniff" }, { key: "X-Frame-Options", value: "SAMEORIGIN" }, { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }, { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }] }, { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache" }] }],
};
export default config;
