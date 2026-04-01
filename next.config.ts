import type { NextConfig } from "next";

// Prevent dev server from crashing when a client disconnects mid-request (ECONNRESET)
// This commonly happens when a browser tab is closed/refreshed during long-running API calls
process.on("uncaughtException", (err: NodeJS.ErrnoException) => {
  if (err.code === "ECONNRESET" || err.code === "EPIPE") {
    // Client disconnected mid-request — safe to ignore in development
    return;
  }
  // Re-throw all other uncaught exceptions normally
  console.error("[Uncaught Exception]", err);
  process.exit(1);
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "rukminim1.flixcart.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
