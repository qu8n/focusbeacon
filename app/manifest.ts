import { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FocusBeacon",
    short_name: "FocusBeacon",
    description:
      "FocusBeacon unlocks insights into your Focusmate sessions, helping you track your progress and stay motivated.",
    start_url: "/",
    display: "standalone",
    icons: [
      {
        src: "/images/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/images/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}
