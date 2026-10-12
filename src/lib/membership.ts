// Browser-safe plan facts. One place to change prices and what each plan includes.
export const LIFETIME_PRICE_CENTS = 499;
export const CURRENCY = "usd";
export const LIFETIME_PRICE_LABEL = "$4.99";
export const LIFETIME_PLAN_NAME = "Kindred Lifetime";
export const LIFETIME_ADDON = "lifetime";
export const FREE_CHAT_LIMIT = 1;

export type PlanRow = { feature: string; basic: string; lifetime: string };

export const PLAN_COMPARISON: PlanRow[] = [
  { feature: "Home dashboard", basic: "Included", lifetime: "Included" },
  { feature: "Letter writer & money guides", basic: "Included", lifetime: "Included" },
  { feature: "Plain-language help guides", basic: "Included", lifetime: "Included" },
  { feature: "Facility notice explainer", basic: "Included", lifetime: "Included" },
  { feature: "Shared family calendar", basic: "Included", lifetime: "Included" },
  { feature: "Family group chats", basic: "1 group", lifetime: "Unlimited" },
  { feature: "Ask helper (AI answers)", basic: "—", lifetime: "Included" },
  { feature: "Reminder settings", basic: "—", lifetime: "Included" },
];

// Older add-on purchases still count as full access.
export function hasLifetimeAccess(owned: readonly string[]): boolean {
  return owned.includes(LIFETIME_ADDON);
}
