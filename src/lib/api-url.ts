// Resolve backend API URLs for both web and native builds.
//
// Web (browser / SSR): relative URLs like "/api/ask" keep working against the
// same origin that serves the app.
//
// Native (Capacitor): there is no local server on the phone, so API calls must
// go to the deployed backend. Set VITE_API_URL to the public base URL of the
// Nitro server (e.g. "https://kindred-api.example.workers.dev") when building
// for Capacitor. See README.md ("Android / Play Store build").
const API_BASE = (import.meta.env['VITE_API_URL'] as string | undefined)?.replace(/\/+$/, "");

export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return API_BASE ? `${API_BASE}${p}` : p;
}
