export type ThemePreference = "light" | "dark";

export type LocaleCode = "en";

export type CurrencyCode = "EUR" | "USD" | "GBP";

export const USER_PREFERENCES_STORAGE = {
  theme: "soccer-monitor-theme",
  locale: "soccer-monitor-locale",
  currency: "soccer-monitor-currency",
  timezone: "soccer-monitor-timezone",
} as const;

export const DEFAULT_THEME: ThemePreference = "light";

/** Set true when dark theme styles are ready across the app. */
export const DARK_MODE_ENABLED = false;
export const DEFAULT_LOCALE: LocaleCode = "en";
export const DEFAULT_CURRENCY: CurrencyCode = "EUR";

export const LOCALE_OPTIONS: ReadonlyArray<{ code: LocaleCode; label: string }> = [
  { code: "en", label: "English" },
];

export const CURRENCY_OPTIONS: ReadonlyArray<{
  code: CurrencyCode;
  label: string;
  symbol: string;
}> = [
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "GBP", label: "British Pound", symbol: "£" },
];

export function isThemePreference(value: string | null): value is ThemePreference {
  return value === "light" || value === "dark";
}

export function isLocaleCode(value: string | null): value is LocaleCode {
  return value === "en";
}

export function isCurrencyCode(value: string | null): value is CurrencyCode {
  return value === "EUR" || value === "USD" || value === "GBP";
}

export function resolveThemePreference(theme: ThemePreference): ThemePreference {
  if (!DARK_MODE_ENABLED && theme === "dark") return "light";
  return theme;
}

export function applyThemeToDocument(theme: ThemePreference) {
  const resolved = resolveThemePreference(theme);
  document.documentElement.classList.toggle("dark", resolved === "dark");
}
