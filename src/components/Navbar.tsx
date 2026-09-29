"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChevronRight, LogOut, Menu, Monitor, Moon, Sun, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

import { isLinkActive, SidebarLink } from "@/components/SidebarItems";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/ui/ThemeToggle";
import { additionalLinks, defaultLinks, mobileTabLinks } from "@/config/nav";
import { cn } from "@/lib/utils";

// Pages already reachable from the tab bar or the profile card are left out of the sheet
const hiddenInSheet = new Set([...mobileTabLinks.map((link) => link.href), "/account"]);
const sheetGroups = [
  { title: "General", links: defaultLinks },
  ...additionalLinks,
].map((group) => ({ ...group, links: group.links.filter((link) => !hiddenInSheet.has(link.href)) }));

const DISMISS_DRAG_DISTANCE = 80;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // "More" is highlighted when the current page is only reachable from the sheet
  const onTabPage = mobileTabLinks.some((link) => isLinkActive(link, pathname));

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <header className="md:hidden sticky top-0 z-40 -mx-4 mb-4 px-4 pt-[env(safe-area-inset-top)] border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="flex h-14 items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/CoolClubF1Logo.svg" alt="CoolClub F1 logo" width={32} height={32} priority />
            <span className="font-semibold text-lg">CoolClub F1</span>
          </Link>
          <ModeToggle />
        </nav>
      </header>

      <nav className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75 pb-[env(safe-area-inset-bottom)]">
        <ul className="grid grid-cols-4">
          {mobileTabLinks.map((link) => (
            <li key={link.href}>
              <TabItem link={link} active={isLinkActive(link, pathname)} />
            </li>
          ))}
          <li>
            <DialogPrimitive.Trigger asChild>
              <button type="button" className={tabClass(!onTabPage || open)}>
                <TabIndicator active={!onTabPage || open} />
                <Menu className="h-5 w-5" />
                <span>More</span>
              </button>
            </DialogPrimitive.Trigger>
          </li>
        </ul>
      </nav>

      <MoreSheet pathname={pathname} onClose={() => setOpen(false)} />
    </DialogPrimitive.Root>
  );
}

const tabClass = (active: boolean) =>
  cn(
    "relative flex h-16 w-full flex-col items-center justify-center gap-1 text-[11px] transition-colors",
    active ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
  );

const TabIndicator = ({ active }: { active: boolean }) => (
  <span
    className={cn(
      "absolute top-0 h-[3px] w-8 rounded-b-full bg-primary transition-opacity",
      active ? "opacity-100" : "opacity-0"
    )}
  />
);

const TabItem = ({ link, active }: { link: SidebarLink; active: boolean }) => (
  <Link href={link.href} className={tabClass(active)} aria-current={active ? "page" : undefined}>
    <TabIndicator active={active} />
    <link.icon className="h-5 w-5" />
    <span>{link.shortTitle ?? link.title}</span>
  </Link>
);

const MoreSheet = ({ pathname, onClose }: { pathname: string; onClose: () => void }) => {
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartY = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (dragStartY.current === null) return;
    setDragOffset(Math.max(0, e.touches[0].clientY - dragStartY.current));
  };
  const onTouchEnd = () => {
    if (dragOffset > DISMISS_DRAG_DISTANCE) onClose();
    dragStartY.current = null;
    setDragOffset(0);
  };

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogPrimitive.Content
        style={dragOffset ? { transform: `translateY(${dragOffset}px)` } : undefined}
        className={cn(
          "md:hidden fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col rounded-t-3xl border-t bg-background shadow-2xl pb-[env(safe-area-inset-bottom)]",
          "duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
          dragStartY.current === null && "transition-transform"
        )}
      >
        <div className="px-4 pt-3 pb-2" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
          <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-muted-foreground/30" />
          <div className="flex items-center justify-between">
            <DialogPrimitive.Title className="text-lg font-semibold">More</DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">Navigate to another page</DialogPrimitive.Description>
            <DialogPrimitive.Close className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-2 space-y-6">
          <ProfileCard active={pathname.startsWith("/account")} onNavigate={onClose} />
          {sheetGroups.map((group) => (
            <SheetLinkGroup
              key={group.title}
              title={group.title}
              links={group.links}
              pathname={pathname}
              onNavigate={onClose}
            />
          ))}
          <ThemeSwitcher />
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/", redirect: true })}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-destructive/10 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/15"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
};

const ProfileCard = ({ active, onNavigate }: { active: boolean; onNavigate: () => void }) => {
  const { data: session } = useSession();
  const user = session?.user;
  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(" ")
        .map((word) => word[0]?.toUpperCase())
        .join("")
    : "~";

  return (
    <Link
      href="/account"
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-2xl bg-muted p-3 transition-colors hover:bg-accent",
        active && "ring-2 ring-primary"
      )}
    >
      <Avatar className="h-12 w-12">
        <AvatarFallback className="bg-primary text-primary-foreground font-semibold">{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="font-semibold truncate">{user.name ?? "Your account"}</p>
        {user.email ? <p className="text-xs text-muted-foreground truncate">{user.email}</p> : null}
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
};

const SheetLinkGroup = ({
  links,
  title,
  pathname,
  onNavigate,
}: {
  links: SidebarLink[];
  title: string;
  pathname: string;
  onNavigate: () => void;
}) => {
  const { data: session } = useSession();
  const visibleLinks = links.filter((link) => !link.onlyFor || session?.user?.email === link.onlyFor);
  if (visibleLinks.length === 0) return null;

  return (
    <section>
      <h4 className="px-3 mb-2 text-xs uppercase text-muted-foreground tracking-wider">{title}</h4>
      <ul className="rounded-2xl bg-muted overflow-hidden divide-y divide-background">
        {visibleLinks.map((link) => {
          const active = isLinkActive(link, pathname);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className="flex items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-accent"
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                    active ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                </span>
                <span className={cn("flex-1", active && "font-semibold")}>{link.title}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

const themeOptions = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  return (
    <section>
      <h4 className="px-3 mb-2 text-xs uppercase text-muted-foreground tracking-wider">Appearance</h4>
      <div className="grid grid-cols-3 gap-1 rounded-2xl bg-muted p-1">
        {themeOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            aria-pressed={theme === option.value}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm transition-all",
              theme === option.value
                ? "bg-background font-semibold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <option.icon className="h-4 w-4" />
            {option.label}
          </button>
        ))}
      </div>
    </section>
  );
};
