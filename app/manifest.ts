import { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Focusbeacon",
    short_name: "Focusbeacon",
    description:
      "Focusbeacon helps Focusmate users be more consistent and motivated. Unlock insights from your sessions, track weekly goals, and more.",
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
