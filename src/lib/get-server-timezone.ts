import { cookies, headers } from "next/headers";
import { DEFAULT_TIMEZONE, isValidTimeZone, readTimeZoneCookie, TIMEZONE_COOKIE } from "@/lib/timezone";

export async function getServerTimeZone(): Promise<string> {
  const cookieStore = await cookies();
  const fromCookies = cookieStore.get(TIMEZONE_COOKIE)?.value;
  if (isValidTimeZone(fromCookies)) {
    return fromCookies;
  }

  const headerStore = await headers();
  const fromHeader = readTimeZoneCookie(headerStore.get("cookie"));
  if (fromHeader) {
    return fromHeader;
  }

  return DEFAULT_TIMEZONE;
}
