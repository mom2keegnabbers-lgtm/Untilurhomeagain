import { describe, expect, it } from "vitest";
import { matchingLeadDay } from "@/lib/reminders";

describe("per-member reminder lead times", () => {
  it("sends when today is one of the member's lead days", () => {
    expect(matchingLeadDay("2026-10-15", [1, 7], "2026-10-08")).toBe(7);
  });
  it("does not send on days between lead times", () => {
    expect(matchingLeadDay("2026-10-15", [1, 7], "2026-10-10")).toBeNull();
  });
  it("supports a same-day reminder", () => {
    expect(matchingLeadDay("2026-10-08", [0], "2026-10-08")).toBe(0);
  });
});
