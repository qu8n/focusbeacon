// Declares the modules you get from importing an image, which app/layout.tsx
// does for the Open Graph image.
//
// Next writes these same references into next-env.d.ts, but that file is a
// build artifact and gitignored, so on a fresh clone it does not exist until
// something runs `next build` or `next dev`. Committing them here means
// `tsc --noEmit` stands on its own -- which is what lets CI typecheck before
// building rather than after.
/// <reference types="next" />
/// <reference types="next/image-types/global" />
