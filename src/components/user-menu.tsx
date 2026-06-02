"use client";

import {
  Banknote,
  CircleUser,
  Globe,
  LogIn,
  Moon,
  Sun,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { glassFocus, glassInset, glassStrong } from "@/components/glass-surface";
import { useUserPreferences } from "@/components/user-preferences-provider";
import {
  CURRENCY_OPTIONS,
  DARK_MODE_ENABLED,
  LOCALE_OPTIONS,
  type CurrencyCode,
  type ThemePreference,
} from "@/lib/user-preferences";
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

function headerBottomForTrigger(trigger: HTMLElement) {
  const header =
    trigger.closest("header") ?? document.getElementById(APP_HEADER_ID);
  return header?.getBoundingClientRect().bottom ?? trigger.getBoundingClientRect().bottom;
}

function MenuSection({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-3 py-2.5", className)}>
      <p className="mb-2 text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-neutral-500">
        {label}
      </p>
      {children}
    </div>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useUserPreferences();

  const options: {
    value: ThemePreference;
    label: string;
    icon: typeof Sun;
    disabled?: boolean;
  }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon, disabled: !DARK_MODE_ENABLED },
  ];

  return (
    <div
      className={cn(glassInset, "flex gap-0.5 rounded-full p-0.5")}
      role="group"
      aria-label="Theme"
    >
      {options.map(({ value, label, icon: Icon, disabled }) => {
        const active = theme === value;

        return (
          <button
            key={value}
            type="button"
            disabled={disabled}
            onClick={() => setTheme(value)}
            aria-pressed={active}
            aria-disabled={disabled}
            title={disabled ? "Dark mode coming soon" : undefined}
            className={cn(
              glassFocus,
              "flex flex-1 items-center justify-center gap-1.5 rounded-full px-2.5 py-1.5 text-[0.75rem] font-medium transition-colors",
              disabled
                ? "cursor-not-allowed opacity-45"
                : "cursor-pointer",
              active && !disabled
                ? "bg-foreground text-background"
                : !disabled && "text-neutral-600 hover:text-neutral-950",
              disabled && "text-neutral-400",
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );
}

function PreferenceSelect<T extends string>({
  id,
  value,
  onChange,
  options,
  disabled,
  icon: Icon,
}: {
  id: string;
  value: T;
  onChange: (value: T) => void;
  options: ReadonlyArray<{ code: T; label: string }>;
  disabled?: boolean;
  icon: typeof Globe;
}) {
  return (
    <div className="relative">
      <Icon
        className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400"
        strokeWidth={2}
        aria-hidden
      />
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as T)}
        className={cn(
          glassInset,
          glassFocus,
          "w-full cursor-pointer appearance-none rounded-lg py-2 pr-8 pl-8 text-[0.8125rem] font-medium text-neutral-900 transition-colors",
          disabled && "cursor-not-allowed opacity-70",
        )}
      >
        {options.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </select>
      <span
        className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[0.625rem] text-neutral-400"
        aria-hidden
      >
        ▾
      </span>
    </div>
  );
}

function UserMenuPanel({
  menuId,
  position,
  onClose,
}: {
  menuId: string;
  position: MenuPosition;
  onClose: () => void;
}) {
  const { locale, currency, setLocale, setCurrency } = useUserPreferences();

  return (
    <>
      <button
        type="button"
        className="user-menu-backdrop-enter fixed right-0 bottom-0 left-0 cursor-default bg-black/[0.14] motion-reduce:animate-none"
        style={{ top: position.headerBottom, zIndex: MENU_Z_BACKDROP }}
        aria-label="Close account menu"
        onClick={onClose}
      />
      <div
        id={menuId}
        role="menu"
        style={{
          position: "fixed",
          top: position.top,
          right: position.right,
          zIndex: MENU_Z_PANEL,
        }}
        className={cn(
          glassStrong,
          "user-menu-liquid motion-reduce:animate-none",
          "w-[min(17rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-black/[0.06] py-1 shadow-[0_12px_32px_rgba(15,23,42,0.14)]",
        )}
      >
        <button
          type="button"
          role="menuitem"
          className={cn(
            glassFocus,
            "flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left text-[0.8125rem] font-medium text-neutral-900 transition-colors hover:bg-white/60",
          )}
          onClick={onClose}
        >
          <LogIn className="h-4 w-4 shrink-0 text-neutral-500" strokeWidth={2} aria-hidden />
          Sign in
        </button>

        <div className="mx-3 border-t border-black/[0.06]" aria-hidden />

        <MenuSection label="Appearance">
          <ThemeToggle />
        </MenuSection>

        <div className="mx-3 border-t border-black/[0.06]" aria-hidden />

        <MenuSection label="Language">
          <PreferenceSelect
            id={`${menuId}-locale`}
            value={locale}
            onChange={setLocale}
            options={LOCALE_OPTIONS}
            disabled={LOCALE_OPTIONS.length <= 1}
            icon={Globe}
          />
        </MenuSection>

        <MenuSection label="Currency" className="pt-0">
          <PreferenceSelect<CurrencyCode>
            id={`${menuId}-currency`}
            value={currency}
            onChange={setCurrency}
            options={CURRENCY_OPTIONS.map((option) => ({
              code: option.code,
              label: `${option.label} (${option.symbol})`,
            }))}
            icon={Banknote}
          />
        </MenuSection>
      </div>
    </>
  );
}

export function UserMenu() {
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const headerBottom = headerBottomForTrigger(trigger);

    setPosition({
      top: headerBottom + MENU_GAP_PX,
      right: Math.max(12, window.innerWidth - rect.right),
      headerBottom,
    });
  }, []);

  const closeMenu = useCallback(() => setOpen(false), []);

  const openMenu = useCallback(() => {
    updatePosition();
    setOpen(true);
  }, [updatePosition]);

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
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeMenu, open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? closeMenu() : openMenu())}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        aria-label={open ? "Close account menu" : "Open account menu"}
        className={cn(
          glassInset,
          glassFocus,
          "flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-neutral-700 transition-colors hover:text-neutral-950",
        )}
      >
        <CircleUser className="h-[1.25rem] w-[1.25rem]" strokeWidth={1.75} aria-hidden />
      </button>

      {mounted && open && position
        ? createPortal(
            <UserMenuPanel menuId={menuId} position={position} onClose={closeMenu} />,
            document.body,
          )
        : null}
    </>
  );
}
