/** Whole days from `today` until `eventDate` (both YYYY-MM-DD). */
export function daysUntil(eventDate: string, today: string): number {
  const a = Date.UTC(+today.slice(0, 4), +today.slice(5, 7) - 1, +today.slice(8, 10));
  const b = Date.UTC(+eventDate.slice(0, 4), +eventDate.slice(5, 7) - 1, +eventDate.slice(8, 10));
  return Math.round((b - a) / 86400000);
}

/** A reminder is due from `remindDaysBefore` days ahead through the event day itself. */
export function isReminderDue(eventDate: string, remindDaysBefore: number, today: string): boolean {
  const d = daysUntil(eventDate, today);
  return d >= 0 && d <= remindDaysBefore;
}

export function localToday(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}

/** Which of a member's lead times (days before) matches today for this event, if any. */
export function matchingLeadDay(eventDate: string, leadDays: number[], today: string): number | null {
  const d = daysUntil(eventDate, today);
  return leadDays.includes(d) ? d : null;
}
