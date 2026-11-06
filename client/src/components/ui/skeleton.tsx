import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

/**
 * Base pulsing block used to compose loading skeletons.
 * Override shape/size via `className`.
 */
function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200/90 dark:bg-gray-800",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
