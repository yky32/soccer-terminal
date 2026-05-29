"use client";

import { useState, type MouseEvent } from "react";
import type { CountryMatchActivity } from "@/lib/data/live-match-countries";

const PREVIEW_COUNT = 3;

type MapLiveStatsCardProps = {
  countryCount: number;
  totalMatches: number;
  countries: CountryMatchActivity[];
  selectedCountryCode?: string | null;
  onCountrySelect?: (country: CountryMatchActivity) => void;
  onResetView?: () => void;
  loading?: boolean;
  error?: string | null;
  updatedAt?: string | null;
};

export function MapLiveStatsCard({
  countryCount,
  totalMatches,
  countries,
  selectedCountryCode = null,
  onCountrySelect,
  onResetView,
  loading = false,
  error = null,
  updatedAt = null,
}: MapLiveStatsCardProps) {
  const [showAll, setShowAll] = useState(false);
  const sorted = [...countries].sort((a, b) => b.liveMatches - a.liveMatches);
  const visible = showAll ? sorted : sorted.slice(0, PREVIEW_COUNT);
  const hiddenCount = sorted.length - PREVIEW_COUNT;

  const handleCardClick = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("[data-map-list-action]")) return;
    onResetView?.();
  };

  return (
    <div
      role="presentation"
      onClick={handleCardClick}
      className="pointer-events-auto w-[12.25rem] cursor-default rounded-lg border border-neutral-200/60 bg-neutral-100/75 px-3 py-2.5 shadow-[0_1px_6px_rgba(0,0,0,0.04)] backdrop-blur-md sm:w-[12.75rem]"
    >
      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
        Live now
        {loading ? (
          <span className="ml-1.5 font-normal normal-case text-neutral-400">
            · updating
          </span>
        ) : null}
      </p>

      {error ? (
        <p className="mt-2 text-[11px] leading-snug text-red-600">{error}</p>
      ) : null}

      <dl className="mt-2 grid grid-cols-2 gap-x-3.5 gap-y-1">
        <div>
          <dd className="text-[1.35rem] font-bold tabular-nums leading-none text-neutral-900">
            {countryCount}
          </dd>
          <dt className="text-xs text-neutral-500">
            {countryCount === 1 ? "Country" : "Countries"}
          </dt>
        </div>
        <div>
          <dd className="text-[1.35rem] font-bold tabular-nums leading-none text-neutral-900">
            {totalMatches}
          </dd>
          <dt className="text-xs text-neutral-500">
            {totalMatches === 1 ? "Match" : "Matches"}
          </dt>
        </div>
      </dl>

      {updatedAt && !error ? (
        <p className="mt-1.5 text-[10px] leading-tight text-neutral-400">
          Updated{" "}
          {new Date(updatedAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      ) : null}

      {!error && sorted.length > 0 ? (
        <div className="mt-2 border-t border-neutral-100 pt-2" data-map-list-action>
          <ul className="space-y-0.5">
            {visible.map((country) => {
              const isSelected = selectedCountryCode === country.code;

              return (
                <li key={country.code}>
                  <button
                    type="button"
                    onClick={() => onCountrySelect?.(country)}
                    className={`flex w-full items-center justify-between gap-2 rounded-md px-1.5 py-1 text-left text-[11px] leading-tight transition-colors ${
                      isSelected
                        ? "bg-neutral-200/80 text-neutral-900"
                        : "text-neutral-700 hover:bg-neutral-200/50"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                          isSelected ? "bg-emerald-600" : "bg-emerald-500"
                        }`}
                        aria-hidden="true"
                      />
                      <span className="truncate">{country.name}</span>
                    </span>
                    <span className="shrink-0 tabular-nums font-semibold text-neutral-500">
                      {country.liveMatches}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {hiddenCount > 0 ? (
            <button
              type="button"
              onClick={() => setShowAll((open) => !open)}
              className="mt-1.5 w-full text-left text-[10px] font-medium text-neutral-500 hover:text-neutral-800"
            >
              {showAll ? "Show less" : `+${hiddenCount} more countries`}
            </button>
          ) : null}
        </div>
      ) : !error && !loading ? (
        <p className="mt-2 text-[11px] text-neutral-500">No live matches right now</p>
      ) : null}
    </div>
  );
}
