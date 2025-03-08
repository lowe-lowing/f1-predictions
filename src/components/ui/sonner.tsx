"use client";

import { useTheme } from "next-themes";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirected = searchParams.get("redirected");
  if (redirected !== null) {
    const page = usePathname();
    toast(`Redirected to ${page}`);
    console.log(`Redirected to ${page}`);
    const params = new URLSearchParams(searchParams);
    params.delete("redirected");
    const newUrl = `${page}?${params.toString()}`;
    router.replace(newUrl);
  }

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
