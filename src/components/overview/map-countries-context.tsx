"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { LiveCountriesBothResponse } from "@/lib/data/live-match-countries";
import {
  readCachedMapSnapshot,
  writeCachedMapSnapshot,
} from "@/lib/football/local-map-cache";
import { CLIENT_MAP_REFRESH_MS, MAP_LOCAL_TTL_MS } from "@/lib/football/refresh-policy";
import { formatFetchError } from "@/lib/format-fetch-error";
import { apiRequest } from "@/lib/http/api-client";
import { usePageVisible } from "@/lib/use-page-visible";

type MapCountriesContextValue = {
  data: LiveCountriesBothResponse | null;
  loading: boolean;
  error: string | null;
  refresh: (options?: { silent?: boolean }) => Promise<void>;
};

const MapCountriesContext = createContext<MapCountriesContextValue | null>(null);

export function MapCountriesProvider({ children }: { children: ReactNode }) {
  const pageVisible = usePageVisible();
  const [data, setData] = useState<LiveCountriesBothResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    const cached = readCachedMapSnapshot();
    const cachedFresh = cached ? Date.now() - cached.cachedAt < MAP_LOCAL_TTL_MS : false;

    if (cached && !silent) {
      setData(cached.snapshot);
      setLoading(false);
      setError(null);
    }

    if (cachedFresh) return;

    try {
      if (!silent && !cached) setLoading(true);

      const { data: response } = await apiRequest<LiveCountriesBothResponse>({
        scope: "client",
        provider: "internal",
        method: "GET",
        url: "/api/map/live-countries",
        query: { mode: "both" },
      });

      if (response.error) {
        throw new Error(formatFetchError(response.error));
      }

      setData(response);
      writeCachedMapSnapshot(response);
      setError(null);
    } catch (err) {
      if (!silent && !cached) {
        const message =
          err instanceof Error ? err.message : "Failed to load matches";
        setError(formatFetchError(message));
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!pageVisible) return;

    const interval = setInterval(
      () => void refresh({ silent: true }),
      CLIENT_MAP_REFRESH_MS,
    );
    return () => clearInterval(interval);
  }, [pageVisible, refresh]);

  const wasHiddenRef = useRef(false);
  useEffect(() => {
    if (!pageVisible) {
      wasHiddenRef.current = true;
      return;
    }

    if (wasHiddenRef.current) {
      wasHiddenRef.current = false;
      void refresh({ silent: true });
    }
  }, [pageVisible, refresh]);

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
