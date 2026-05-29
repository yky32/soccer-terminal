export type NavItem = {
  href: string;
  label: string;
  description: string;
};

export const mainNav: NavItem[] = [
  {
    href: "/",
    label: "Overview",
    description: "Platform summary and quick links",
  },
  {
    href: "/map",
    label: "Global Map",
    description: "Live and upcoming matches worldwide",
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Analytics panels and match insights",
  },
  {
    href: "/youth",
    label: "Youth Academies",
    description: "Talent monitoring and development",
  },
  {
    href: "/women",
    label: "Women's Football",
    description: "Dedicated women's league coverage",
  },
  {
    href: "/scouting",
    label: "Scouting",
    description: "Player search, compare, and similarity",
  },
  {
    href: "/assistant",
    label: "AI Assistant",
    description: "Briefings and conversational insights",
  },
];
