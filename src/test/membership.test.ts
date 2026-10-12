import { describe, expect, it } from "vitest";
import {
  CURRENCY,
  FREE_CHAT_LIMIT,
  hasLifetimeAccess,
  LIFETIME_PRICE_CENTS,
  LIFETIME_PRICE_LABEL,
} from "@/lib/membership";

describe("plan rules", () => {
  it("Lifetime is a $4.99 one-time charge in US dollars", () => {
    expect(LIFETIME_PRICE_CENTS).toBe(499);
    expect(LIFETIME_PRICE_LABEL).toBe("$4.99");
    expect(CURRENCY).toBe("usd");
  });

  it("Basic gets one free family chat", () => {
    expect(FREE_CHAT_LIMIT).toBe(1);
  });

  it("only a saved lifetime purchase unlocks premium", () => {
    expect(hasLifetimeAccess(["lifetime"])).toBe(true);
    expect(hasLifetimeAccess([])).toBe(false);
    expect(hasLifetimeAccess(["ask"])).toBe(false);
  });
});
