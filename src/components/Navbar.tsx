"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";

import { AlignRight } from "lucide-react";
import { defaultLinks, additionalLinks } from "@/config/nav";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <div className="md:hidden border-b mb-4 pb-2 w-full">
      <nav className="flex justify-between w-full items-center">
        <Link href={"/dashboard"} className="flex items-center gap-2">
          <Image src="/CoolClubF1Logo.svg" alt="CoolClub F1 logo" width={34} height={34} priority />
          <div className="font-semibold text-lg">CoolClub F1</div>
        </Link>
        <Button variant="ghost" onClick={() => setOpen(!open)}>
          <AlignRight />
        </Button>
      </nav>
      {open ? (
        <div className="my-4 p-4 bg-muted">
          <ul className="space-y-2">
            {defaultLinks.map((link) => (
              <li key={link.title} onClick={() => setOpen(false)} className="">
                <Link
                  href={link.href}
                  className={
                    pathname === link.href
                      ? "text-primary hover:text-primary font-semibold"
                      : "text-muted-foreground hover:text-primary"
                  }
                >
                  {link.title}
                </Link>
              </li>
            ))}
            {additionalLinks.map((group) => (
              <li key={group.title} className="border-t border-border pt-2 mt-2">
                <h4 className="text-xs uppercase text-muted-foreground tracking-wider">{group.title}</h4>
                <ul className="space-y-2">
                  {group.links.map((link) => (
                    <li key={link.title} onClick={() => setOpen(false)}>
                      <Link
                        href={link.href}
                        className={
                          pathname === link.href
                            ? "text-primary hover:text-primary font-semibold"
                            : "text-muted-foreground hover:text-primary"
                        }
                      >
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
