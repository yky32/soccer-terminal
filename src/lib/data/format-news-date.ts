const MINUTE = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

export function formatNewsRelativeTime(isoDate: string, now = Date.now()) {
  const published = new Date(isoDate).getTime();
  const diff = now - published;

  if (diff < MINUTE) return "Just now";
  if (diff < HOUR) {
    const minutes = Math.floor(diff / MINUTE);
    return `${minutes}m ago`;
  }
  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR);
    return `${hours}h ago`;
  }
  if (diff < DAY * 7) {
    const days = Math.floor(diff / DAY);
    return `${days}d ago`;
  }

  return new Date(isoDate).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatNewsTimestamp(isoDate: string) {
  return new Date(isoDate).toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
