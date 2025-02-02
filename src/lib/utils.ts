import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

{
  /* <pre className="bg-secondary p-4 rounded-sm shadow-sm text-secondary-foreground break-all whitespace-break-spaces">
        {JSON.stringify(positions, null, 2)}
      </pre> */
}
