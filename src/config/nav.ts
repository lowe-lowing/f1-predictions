import { SidebarLink } from "@/components/SidebarItems";
import { CarFront, Cog, HomeIcon, List, Lock, Trophy, User } from "lucide-react";

type AdditionalLinks = {
  title: string;
  links: SidebarLink[];
};

export const defaultLinks: SidebarLink[] = [
  { href: "/dashboard", title: "Home", icon: HomeIcon },
  { href: "/predictions", title: "Your Predictions", icon: List },
  { href: "/top5explorer", title: "Top 5 Explorer", icon: Trophy },
  { href: "/account", title: "Account", icon: User },
  { href: "/settings", title: "Settings", icon: Cog },
];

export const additionalLinks: AdditionalLinks[] = [
  {
    title: "Entities",
    links: [
      {
        href: "/drivers",
        title: "Drivers",
        icon: CarFront,
      },
      {
        href: "/user-permissions",
        title: "User Permissions",
        icon: Lock,
        onlyFor: "lowe.lowing@gmail.com",
      },
    ],
  },
];
