import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const seasons = [2025, 2024];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const timestamps: { createdAt: true; updatedAt: true } = {
  createdAt: true,
  updatedAt: true,
};

export function nanoid() {
  return require("nanoid").nanoid();
}

export type Action = "create" | "update" | "delete";

export type OptimisticAction<T> = {
  action: Action;
  data: T;
};

{
  /* <pre className="bg-secondary p-4 rounded-sm shadow-sm text-secondary-foreground break-all whitespace-break-spaces">
        {JSON.stringify(positions, null, 2)}
      </pre> */
}
