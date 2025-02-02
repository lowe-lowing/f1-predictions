import { SidebarLink } from "@/components/SidebarItems";
import { Cog, Globe, User, HomeIcon, List } from "lucide-react";

type AdditionalLinks = {
  title: string;
  links: SidebarLink[];
};

export const defaultLinks: SidebarLink[] = [
  { href: "/dashboard", title: "Home", icon: HomeIcon },
  { href: "/predictions", title: "Your Predictions", icon: List },
  { href: "/account", title: "Account", icon: User },
  { href: "/settings", title: "Settings", icon: Cog },
];

export const additionalLinks: AdditionalLinks[] = [];
