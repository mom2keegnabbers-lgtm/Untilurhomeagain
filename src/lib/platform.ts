import { Capacitor } from "@capacitor/core";

// True when running inside the Capacitor native shell (Android / iOS).
// Safe to call on web — @capacitor/core reports false in a regular browser.
export function isNativeApp(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}
