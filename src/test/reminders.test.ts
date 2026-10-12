import { describe, expect, it } from "vitest";
import { isReminderDue } from "@/lib/reminders";

describe("calendar reminders", () => {
  it("is due when within the reminder window", () => {
    expect(isReminderDue("2026-10-10", 3, "2026-10-07")).toBe(true);
  });
  it("is not due before the window opens", () => {
    expect(isReminderDue("2026-10-10", 2, "2026-10-07")).toBe(false);
  });
  it("is due on the event day", () => {
    expect(isReminderDue("2026-10-07", 0, "2026-10-07")).toBe(true);
  });
  it("is not due after the event passed", () => {
    expect(isReminderDue("2026-10-06", 7, "2026-10-07")).toBe(false);
  });
});
