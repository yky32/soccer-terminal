"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type AppChromeContextValue = {
  headerHidden: boolean;
  setHeaderHidden: (hidden: boolean) => void;
};

const AppChromeContext = createContext<AppChromeContextValue | null>(null);

export function AppChromeProvider({ children }: { children: React.ReactNode }) {
  const [headerHidden, setHeaderHiddenState] = useState(false);

  const setHeaderHidden = useCallback((hidden: boolean) => {
    setHeaderHiddenState(hidden);
  }, []);

  const value = useMemo(
    () => ({ headerHidden, setHeaderHidden }),
    [headerHidden, setHeaderHidden],
  );

  return <AppChromeContext.Provider value={value}>{children}</AppChromeContext.Provider>;
}

export function useAppChrome() {
  const context = useContext(AppChromeContext);
  if (!context) {
    throw new Error("useAppChrome must be used within AppChromeProvider");
  }
  return context;
}
