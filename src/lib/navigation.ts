export type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  description: string;
};

export const mainNav: NavItem[] = [
  {
    href: "/",
    label: "Overview",
    shortLabel: "Overview",
    description: "Platform summary and quick links",
  },
  {
    href: "/map",
    label: "Global Map",
    shortLabel: "Map",
    description: "Live and upcoming matches worldwide",
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    shortLabel: "Dashboard",
    description: "Analytics panels and match insights",
  },
  {
    href: "/youth",
    label: "Youth Academies",
    shortLabel: "Youth",
    description: "Talent monitoring and development",
  },
  {
    href: "/women",
    label: "Women's Football",
    shortLabel: "Women",
    description: "Dedicated women's league coverage",
  },
  {
    href: "/scouting",
    label: "Scouting",
    shortLabel: "Scouting",
    description: "Player search, compare, and similarity",
  },
  {
    href: "/assistant",
    label: "AI Assistant",
    shortLabel: "AI",
    description: "Briefings and conversational insights",
  },
];
