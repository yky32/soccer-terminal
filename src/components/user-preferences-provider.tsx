"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  applyThemeToDocument,
  DEFAULT_CURRENCY,
  DEFAULT_LOCALE,
  DEFAULT_THEME,
  isCurrencyCode,
  isLocaleCode,
  isThemePreference,
  resolveThemePreference,
  USER_PREFERENCES_STORAGE,
  type CurrencyCode,
  type LocaleCode,
  type ThemePreference,
} from "@/lib/user-preferences";

type UserPreferencesContextValue = {
  theme: ThemePreference;
  locale: LocaleCode;
  currency: CurrencyCode;
  setTheme: (theme: ThemePreference) => void;
  setLocale: (locale: LocaleCode) => void;
  setCurrency: (currency: CurrencyCode) => void;
  ready: boolean;
};

const UserPreferencesContext = createContext<UserPreferencesContextValue | null>(null);

function readStoredPreferences() {
  if (typeof window === "undefined") {
    return {
      theme: DEFAULT_THEME,
      locale: DEFAULT_LOCALE,
      currency: DEFAULT_CURRENCY,
    };
  }

  const themeRaw = localStorage.getItem(USER_PREFERENCES_STORAGE.theme);
  const localeRaw = localStorage.getItem(USER_PREFERENCES_STORAGE.locale);
  const currencyRaw = localStorage.getItem(USER_PREFERENCES_STORAGE.currency);

  const theme = isThemePreference(themeRaw) ? themeRaw : DEFAULT_THEME;

  return {
    theme: resolveThemePreference(theme),
    locale: isLocaleCode(localeRaw) ? localeRaw : DEFAULT_LOCALE,
    currency: isCurrencyCode(currencyRaw) ? currencyRaw : DEFAULT_CURRENCY,
  };
}

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(() => readStoredPreferences());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readStoredPreferences();
    setPreferences(stored);
    applyThemeToDocument(stored.theme);
    setReady(true);
  }, []);

  const setTheme = useCallback((theme: ThemePreference) => {
    const resolved = resolveThemePreference(theme);
    setPreferences((prev) => ({ ...prev, theme: resolved }));
    applyThemeToDocument(resolved);
    localStorage.setItem(USER_PREFERENCES_STORAGE.theme, resolved);
  }, []);

  const setLocale = useCallback((locale: LocaleCode) => {
    setPreferences((prev) => ({ ...prev, locale }));
    localStorage.setItem(USER_PREFERENCES_STORAGE.locale, locale);
  }, []);

  const setCurrency = useCallback((currency: CurrencyCode) => {
    setPreferences((prev) => ({ ...prev, currency }));
    localStorage.setItem(USER_PREFERENCES_STORAGE.currency, currency);
  }, []);

  const value = useMemo(
    () => ({
      ...preferences,
      setTheme,
      setLocale,
      setCurrency,
      ready,
    }),
    [preferences, ready, setCurrency, setLocale, setTheme],
  );

  return (
    <UserPreferencesContext.Provider value={value}>{children}</UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error("useUserPreferences must be used within UserPreferencesProvider");
  }
  return context;
}
