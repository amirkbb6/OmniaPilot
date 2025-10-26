import { withSuperjson } from "next-superjson-plugin";

const nextConfig = withSuperjson()({
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb"
    }
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.amazonaws.com" },
      { protocol: "https", hostname: "localhost" },
      { protocol: "https", hostname: "*.puriva.studio" }
    ]
  }
});

export default nextConfig;
