"use client";

import { useTheme } from "next-themes";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const redirected = searchParams.get("redirected");
    if (redirected !== null) {
      toast(`Redirected to ${path}`);
      console.log(`Redirected to ${path}`);
      const params = new URLSearchParams(searchParams);
      params.delete("redirected");
      const newUrl = `${path}?${params.toString()}`;
      router.replace(newUrl);
    }
  }, []);

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
