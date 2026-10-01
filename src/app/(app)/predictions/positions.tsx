import { cn } from "@/lib/utils";
import type { FC } from "react";

// 1 point for a driver finishing in the top 5, +1 more for the exact position
export const MAX_POINTS_PER_DRIVER = 2;
export const MAX_POINTS_PER_RACE = MAX_POINTS_PER_DRIVER * 5;

const positionStyles = [
  "bg-amber-400 text-amber-950",
  "bg-zinc-300 text-zinc-900",
  "bg-orange-700 text-orange-50",
  "bg-muted text-muted-foreground",
  "bg-muted text-muted-foreground",
];

interface PositionBadgeProps {
  index: number;
  className?: string;
  children?: React.ReactNode;
}

export const PositionBadge: FC<PositionBadgeProps> = ({ index, className, children }) => (
  <span
    className={cn(
      "inline-flex h-7 w-9 shrink-0 items-center justify-center rounded-md text-sm font-semibold tabular-nums",
      positionStyles[Math.min(index, positionStyles.length - 1)],
      className
    )}
  >
    {children ?? `P${index + 1}`}
  </span>
);

interface DriverAvatarProps {
  image: string | null;
  name: string | null;
  className?: string;
}

export const DriverAvatar: FC<DriverAvatarProps> = ({ image, name, className }) =>
  image ? (
    <img src={image} alt={name ?? ""} className={cn("h-10 w-10 shrink-0 rounded-full bg-muted object-cover object-top", className)} />
  ) : (
    <span
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground",
        className
      )}
    >
      {name?.slice(0, 3).toUpperCase()}
    </span>
  );

export const PointsMarker: FC<{ points: number; className?: string }> = ({ points, className }) => (
  <span
    className={cn("w-8 shrink-0 text-right text-sm font-semibold tabular-nums", className, {
      "text-emerald-600 dark:text-emerald-400": points === MAX_POINTS_PER_DRIVER,
      "text-sky-600 dark:text-sky-400": points > 0 && points < MAX_POINTS_PER_DRIVER,
      "text-muted-foreground/60": points === 0,
    })}
  >
    {points > 0 ? `+${points}` : "0"}
  </span>
);
