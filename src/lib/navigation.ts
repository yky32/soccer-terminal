export type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  description: string;
};

export const mainNav: NavItem[] = [
  {
    href: "/",
    label: "Global",
    shortLabel: "Global",
    description: "Live and upcoming matches worldwide",
  },
  {
    href: "/news",
    label: "News",
    shortLabel: "News",
    description: "Football headlines, transfers, and breaking stories",
  },
  {
    href: "/leagues",
    label: "Leagues",
    shortLabel: "Leagues",
    description: "Standings, fixtures, and league dashboards",
  },
  {
    href: "/assistant",
    label: "AI Assistant",
    shortLabel: "AI",
    description: "Briefings and conversational insights",
  },
];
