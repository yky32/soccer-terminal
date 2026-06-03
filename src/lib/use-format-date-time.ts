"use client";

import { useMemo } from "react";
import { useUserPreferences } from "@/components/user-preferences-provider";
import { createDateTimeFormatters } from "@/lib/format-date-time";

export function useFormatDateTime() {
  const { locale, timeZone } = useUserPreferences();

  return useMemo(
    () => createDateTimeFormatters({ locale, timeZone }),
    [locale, timeZone],
  );
}
