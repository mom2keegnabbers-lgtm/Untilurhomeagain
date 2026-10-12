// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    // Static SPA output for the Capacitor native build — Capacitor's webDir
    // needs an index.html entry point, which the SSR build does not produce.
    // Enabled only when CAPACITOR_BUILD=1 (see "build:capacitor" in package.json)
    // so the default web build keeps full SSR via Nitro.
    ...(process.env['CAPACITOR_BUILD'] === "1" ? { spa: { enabled: true } } : {}),
  },
});
