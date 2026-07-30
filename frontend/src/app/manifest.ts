import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SparkLive — Where Every Connection Glows",
    short_name: "SparkLive",
    description:
      "Premium social streaming, creator, and discovery platform. Discover people, follow creators, chat, join live streams, and build communities.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0f",
    theme_color: "#0a0a0f",
    icons: [
      { src: "/branding/sparklive-icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/branding/sparklive-icon.svg", sizes: "512x512", type: "image/svg+xml" },
      { src: "/branding/sparklive-icon.svg", sizes: "192x192", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}