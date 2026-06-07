"use client";

import Link from "next/link";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Star, X } from "lucide-react";
import { FootballLogo } from "@/components/overview/football-logo";
import { useMySoccer } from "@/components/my-soccer/my-soccer-provider";
import { useOptionalMapCountries } from "@/components/overview/map-countries-context";
import { glassFocus, glassInset, glassStrong } from "@/components/glass-surface";
import {
  flattenMapMatches,
  isMatchLive,
  matchMinuteLabel,
  sortHeatmapItems,
  teamAbbrev,
  MAX_WATCHLIST,
  type MonitoredMatch,
} from "@/lib/match-monitor";
import { matchHref } from "@/lib/match-paths";
import { teamHref } from "@/lib/team-paths";
import { useFormatDateTime } from "@/lib/use-format-date-time";
import { cn } from "@/lib/utils";

const MENU_Z_BACKDROP = 200;
const MENU_Z_PANEL = 201;
const MENU_GAP_PX = 8;
const APP_HEADER_ID = "app-site-header";

type MenuPosition = {
  top: number;
  right: number;
  headerBottom: number;
};

type DrawerTab = "matches" | "teams";

function headerBottomForTrigger(trigger: HTMLElement) {
  const header =
    trigger.closest("header") ?? document.getElementById(APP_HEADER_ID);
  return header?.getBoundingClientRect().bottom ?? trigger.getBoundingClientRect().bottom;
}

function MatchRow({
  item,
  onRemove,
}: {
  item: MonitoredMatch;
  onRemove: () => void;
}) {
  const { formatKickoffTime } = useFormatDateTime();
  const { match } = item;
  const live = isMatchLive(match);

  return (
    <div className="flex items-center gap-2 px-3 py-2.5">
      <Link
        href={matchHref(match.id)}
        className={cn(glassFocus, "min-w-0 flex-1 rounded-lg transition-colors hover:bg-white/50")}
      >
        <div className="flex items-center gap-2 px-1 py-0.5">
          <span
            className={cn(
              "h-2 w-2 shrink-0 rounded-full",
              live ? "bg-emerald-500" : "bg-neutral-300",
            )}
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <FootballLogo src={match.homeLogo} label={match.homeTeam} size="xs" />
              <p className="truncate text-[0.8125rem] font-semibold text-neutral-950">
                {teamAbbrev(match.homeTeam)}{" "}
                <span className="tabular-nums text-neutral-700">
                  {live || match.statusShort === "FT" ? `${match.homeGoals}–${match.awayGoals}` : "vs"}
                </span>{" "}
                {teamAbbrev(match.awayTeam)}
              </p>
              <FootballLogo src={match.awayLogo} label={match.awayTeam} size="xs" />
            </div>
            <p className="mt-0.5 truncate text-[0.6875rem] text-neutral-500">
              {live
                ? `${matchMinuteLabel(match)} · ${match.league}`
                : match.kickoffAt
                  ? `${formatKickoffTime(match.kickoffAt)} · ${match.league}`
                  : match.league}
            </p>
          </div>
        </div>
      </Link>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove from tracked matches"
        className="rounded-md p-1 text-neutral-400 transition-colors hover:bg-white/60 hover:text-neutral-700"
      >
        <X className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  );
}

function MySoccerPanel({
  menuId,
  position,
  onClose,
}: {
  menuId: string;
  position: MenuPosition;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<DrawerTab>("matches");
  const { watchlistIds, favorites, removeMatch, removeFavorite, clearWatchlist } = useMySoccer();
  const mapContext = useOptionalMapCountries();
  const { formatKickoffTime } = useFormatDateTime();

  useEffect(() => {
    if (!mapContext) return;
    void mapContext.refresh({ silent: true });
  }, [mapContext]);

  const catalog = useMemo(() => {
    if (!mapContext?.data) return [];
    return flattenMapMatches(
      mapContext.data.live.matchesByCountry ?? {},
      mapContext.data.future.matchesByCountry ?? {},
    );
  }, [mapContext?.data]);

  const catalogById = useMemo(() => {
    const map = new Map<number, MonitoredMatch>();
    for (const item of catalog) map.set(item.match.id, item);
    return map;
  }, [catalog]);

  const watchedItems = useMemo(
    () =>
      sortHeatmapItems(
        watchlistIds
          .map((id) => catalogById.get(id))
          .filter((item): item is MonitoredMatch => item !== undefined),
      ),
    [catalogById, watchlistIds],
  );

  const liveItems = watchedItems.filter(({ match }) => isMatchLive(match));
  const otherItems = watchedItems.filter(({ match }) => !isMatchLive(match));
  const unknownCount = watchlistIds.length - watchedItems.length;

  return (
    <>
      <button
        type="button"
        className="user-menu-backdrop-enter fixed right-0 bottom-0 left-0 cursor-default bg-black/[0.14] motion-reduce:animate-none"
        style={{ top: position.headerBottom, zIndex: MENU_Z_BACKDROP }}
        aria-label="Close My Soccer"
        onClick={onClose}
      />
      <div
        id={menuId}
        role="dialog"
        aria-label="My Soccer"
        style={{
          position: "fixed",
          top: position.top,
          right: position.right,
          zIndex: MENU_Z_PANEL,
        }}
        className={cn(
          glassStrong,
          "user-menu-liquid motion-reduce:animate-none",
          "flex max-h-[min(32rem,calc(100dvh-5.5rem))] w-[min(22rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-xl border border-black/[0.06] shadow-[0_12px_32px_rgba(15,23,42,0.14)]",
        )}
      >
        <div className="flex items-center justify-between border-b border-black/[0.06] px-3.5 py-3">
          <div>
            <p className="text-[0.9375rem] font-semibold tracking-[-0.02em] text-neutral-950">
              My Soccer
            </p>
            <p className="text-[0.6875rem] text-neutral-500">Tracked matches and followed teams</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-neutral-500 transition-colors hover:bg-white/60 hover:text-neutral-800"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="flex gap-1 border-b border-black/[0.06] px-3 py-2">
          {(
            [
              { id: "matches" as const, label: "Matches", count: watchlistIds.length },
              { id: "teams" as const, label: "Teams", count: favorites.length },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={cn(
                glassFocus,
                "flex-1 rounded-full px-3 py-1.5 text-[0.75rem] font-medium transition-colors",
                tab === item.id
                  ? "bg-foreground text-background"
                  : "text-neutral-600 hover:bg-white/50 hover:text-neutral-950",
              )}
            >
              {item.label}
              {item.count > 0 ? (
                <span className="ml-1 tabular-nums opacity-80">({item.count})</span>
              ) : null}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {tab === "matches" ? (
            watchlistIds.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-[0.8125rem] text-neutral-600">No tracked matches yet.</p>
                <Link
                  href="/#match-monitor"
                  onClick={onClose}
                  className={cn(
                    glassInset,
                    glassFocus,
                    "mt-3 inline-flex rounded-full px-3.5 py-2 text-[0.8125rem] font-medium text-neutral-800",
                  )}
                >
                  Add from Global map
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-black/[0.05]">
                {liveItems.length > 0 ? (
                  <section>
                    <p className="px-3.5 pt-3 pb-1 text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-emerald-700">
                      Live
                    </p>
                    {liveItems.map((item) => (
                      <MatchRow
                        key={item.match.id}
                        item={item}
                        onRemove={() => removeMatch(item.match.id)}
                      />
                    ))}
                  </section>
                ) : null}
                {otherItems.length > 0 ? (
                  <section>
                    {liveItems.length > 0 ? (
                      <p className="px-3.5 pt-3 pb-1 text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-neutral-500">
                        Upcoming & recent
                      </p>
                    ) : null}
                    {otherItems.map((item) => (
                      <MatchRow
                        key={item.match.id}
                        item={item}
                        onRemove={() => removeMatch(item.match.id)}
                      />
                    ))}
                  </section>
                ) : null}
                {unknownCount > 0 ? (
                  <div className="px-4 py-3 text-[0.75rem] text-neutral-500">
                    {unknownCount} tracked {unknownCount === 1 ? "match is" : "matches are"} not on
                    the current map — open from a match page or refresh the Global map.
                  </div>
                ) : null}
              </div>
            )
          ) : favorites.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-[0.8125rem] text-neutral-600">No followed teams yet.</p>
              <Link
                href="/leagues"
                onClick={onClose}
                className={cn(
                  glassInset,
                  glassFocus,
                  "mt-3 inline-flex rounded-full px-3.5 py-2 text-[0.8125rem] font-medium text-neutral-800",
                )}
              >
                Browse leagues
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-black/[0.05]">
              {favorites.map((team) => (
                <li key={`${team.leagueId}:${team.teamSlug}`} className="flex items-center gap-2 px-3 py-2.5">
                  <Link
                    href={teamHref(team.leagueId, team.teamSlug)}
                    onClick={onClose}
                    className={cn(glassFocus, "flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1 py-0.5 hover:bg-white/50")}
                  >
                    <FootballLogo src={team.teamLogo} label={team.teamName} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-[0.8125rem] font-semibold text-neutral-950">
                        {team.teamName}
                      </p>
                      <p className="truncate text-[0.6875rem] text-neutral-500">
                        {team.leagueShortName}
                      </p>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeFavorite(team.leagueId, team.teamSlug)}
                    aria-label={`Unfollow ${team.teamName}`}
                    className="rounded-md p-1 text-neutral-400 transition-colors hover:bg-white/60 hover:text-neutral-700"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {tab === "matches" && watchlistIds.length > 0 ? (
          <div className="flex items-center justify-between border-t border-black/[0.06] px-3.5 py-2.5">
            <p className="text-[0.6875rem] text-neutral-500">
              {watchlistIds.length}/{MAX_WATCHLIST} tracked
              {mapContext?.data?.live.updatedAt
                ? ` · updated ${formatKickoffTime(mapContext.data.live.updatedAt)}`
                : null}
            </p>
            <button
              type="button"
              onClick={clearWatchlist}
              className="text-[0.75rem] font-medium text-neutral-500 transition-colors hover:text-neutral-800"
            >
              Clear all
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}

export function MySoccerMenu() {
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const { watchlistIds, favorites, ready } = useMySoccer();
  const mapContext = useOptionalMapCountries();

  const catalog = useMemo(() => {
    if (!mapContext?.data) return [];
    return flattenMapMatches(
      mapContext.data.live.matchesByCountry ?? {},
      mapContext.data.future.matchesByCountry ?? {},
    );
  }, [mapContext?.data]);

  const badge = useMemo(() => {
    if (!ready) return 0;
    const liveCount = watchlistIds.filter((id) => {
      const item = catalog.find(({ match }) => match.id === id);
      return item ? isMatchLive(item.match) : false;
    }).length;
    if (liveCount > 0) return liveCount;
    const total = watchlistIds.length + favorites.length;
    return total > 0 ? total : 0;
  }, [catalog, favorites.length, ready, watchlistIds]);

  const updatePosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const headerBottom = headerBottomForTrigger(trigger);

    setPosition({
      top: headerBottom + MENU_GAP_PX,
      right: Math.max(12, window.innerWidth - rect.right),
      headerBottom,
    });
  };

  const closeMenu = () => setOpen(false);

  const openMenu = () => {
    updatePosition();
    setOpen(true);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open) return;

    updatePosition();

    const onRelayout = () => updatePosition();
    window.addEventListener("resize", onRelayout);
    window.addEventListener("scroll", onRelayout, true);

    return () => {
      window.removeEventListener("resize", onRelayout);
      window.removeEventListener("scroll", onRelayout, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const badgeLabel =
    badge > 0
      ? `${badge} item${badge === 1 ? "" : "s"} in My Soccer`
      : "Open My Soccer";

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? closeMenu() : openMenu())}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? menuId : undefined}
        aria-label={open ? "Close My Soccer" : badgeLabel}
        className={cn(
          glassInset,
          glassFocus,
          "relative flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-neutral-700 transition-colors hover:text-neutral-950 sm:px-3",
        )}
      >
        <Star className="h-[1.125rem] w-[1.125rem] shrink-0" strokeWidth={1.75} aria-hidden />
        <span className="hidden text-[0.8125rem] font-medium sm:inline">My Soccer</span>
        {badge > 0 ? (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[0.625rem] font-bold tabular-nums text-background">
            {badge > 99 ? "99+" : badge}
          </span>
        ) : null}
      </button>

      {mounted && open && position
        ? createPortal(
            <MySoccerPanel menuId={menuId} position={position} onClose={closeMenu} />,
            document.body,
          )
        : null}
    </>
  );
}
