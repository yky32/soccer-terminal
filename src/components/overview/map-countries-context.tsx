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
import type { LiveCountriesBothResponse } from "@/lib/data/live-match-countries";
import { CLIENT_MAP_REFRESH_MS } from "@/lib/football/refresh-policy";
import { apiRequest } from "@/lib/http/api-client";

type MapCountriesContextValue = {
  data: LiveCountriesBothResponse | null;
  loading: boolean;
  error: string | null;
  refresh: (options?: { silent?: boolean }) => Promise<void>;
};

const MapCountriesContext = createContext<MapCountriesContextValue | null>(null);

export function MapCountriesProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<LiveCountriesBothResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;

    try {
      if (!silent) setLoading(true);

      const { data: response } = await apiRequest<LiveCountriesBothResponse>({
        scope: "client",
        provider: "internal",
        method: "GET",
        url: "/api/map/live-countries",
        query: { mode: "both" },
      });

      if (response.error) {
        throw new Error(response.error);
      }

      setData(response);
      setError(null);
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : "Failed to load matches");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const interval = setInterval(
      () => void refresh({ silent: true }),
      CLIENT_MAP_REFRESH_MS,
    );
    return () => clearInterval(interval);
  }, [refresh]);

  const value = useMemo(
    () => ({ data, loading, error, refresh }),
    [data, loading, error, refresh],
  );

  return (
    <MapCountriesContext.Provider value={value}>{children}</MapCountriesContext.Provider>
  );
}

export function useMapCountries() {
  const context = useContext(MapCountriesContext);
  if (!context) {
    throw new Error("useMapCountries must be used within MapCountriesProvider");
  }
  return context;
}

/** Optional hook for pages that may render outside the provider. */
export function useOptionalMapCountries() {
  return useContext(MapCountriesContext);
}
