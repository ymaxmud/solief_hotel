import type { MetadataRoute } from "next";

/**
 * Web app manifest. Gives mobile browsers a proper name, colours and icon when
 * a guest adds the site to their home screen, and is one of the signals mobile
 * search uses. Kept minimal — this is a website, not an installable app.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Solief Hotel — Tashkent",
    short_name: "Solief Hotel",
    description:
      "Boutique hotel in the Chilanzar district of Tashkent. Breakfast included, free Wi-Fi, direct booking with the hotel team.",
    start_url: "/",
    display: "browser",
    background_color: "#F7F4ED",
    theme_color: "#15243B",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/icon.png", type: "image/png", sizes: "512x512" },
      { src: "/apple-icon.png", type: "image/png", sizes: "180x180" }
    ]
  };
}
