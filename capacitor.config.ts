import type { CapacitorConfig } from "@capacitor/cli";

// Capacitor native wrapper for the Play Store build.
//
// The web app is bundled with `bun run build:capacitor`, which produces a
// static SPA entry (index.html, copied from the prerendered _shell.html) in
// .output/public — that directory is the webDir below.
//
// Before building the native app:
//   1. Deploy the Nitro backend somewhere public (Cloudflare Workers preset
//      is already configured) and set VITE_API_URL to its base URL — the
//      native app has no local server, so /api/* calls go there.
//   2. Set VITE_REVENUECAT_API_KEY (see src/lib/billing.ts).
const config: CapacitorConfig = {
  appId: "com.kindred.app",
  appName: "Until you're home again",
  webDir: ".output/public",
};

export default config;
