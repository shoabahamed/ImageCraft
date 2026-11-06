import { Skeleton } from "@/components/ui/skeleton";
import type { ReactNode } from "react";

/**
 * Loading skeletons for every Profile tab. Each one mirrors the real
 * section's grid + card shape so content doesn't jump when it loads.
 */

const CARD_GRID =
  "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";

const CARD_SHELL =
  "overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800";

function CardGrid({ children }: { children: ReactNode }) {
  return (
    <div className={CARD_GRID} aria-hidden="true">
      {children}
    </div>
  );
}

/** Projects / Bookmarks tabs — cards with a 48-height image + meta below. */
export function ProjectCardsSkeleton() {
  return (
    <CardGrid>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={CARD_SHELL}>
          <Skeleton className="h-48 w-full rounded-none" />
          <div className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-5 w-32" />
              <div className="flex shrink-0 gap-1.5">
                <Skeleton className="h-5 w-10 rounded-md" />
                <Skeleton className="h-5 w-12 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-3.5 w-40" />
            <div className="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-700">
              <Skeleton className="h-4 w-14" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </CardGrid>
  );
}

/** Reports tab — text-only cards with a status chip and an admin area. */
export function ReportsCardsSkeleton() {
  return (
    <CardGrid>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-gray-200 bg-white p-4 shadow-md dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-start justify-between gap-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <div className="mt-3 space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="mt-3 h-3 w-32" />
          <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 dark:border-gray-700">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </CardGrid>
  );
}

/** Notices tab — cards with a colored header band and a body message. */
export function NoticesCardsSkeleton() {
  return (
    <CardGrid>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <Skeleton className="h-11 w-full rounded-none bg-blue-200/70 dark:bg-blue-950" />
          <div className="space-y-2.5 p-4">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-11/12" />
            <Skeleton className="h-3.5 w-4/5" />
            <div className="flex items-center border-t border-gray-100 pt-3 dark:border-gray-700">
              <Skeleton className="h-4 w-4 rounded-md" />
              <Skeleton className="ml-2 h-3 w-24" />
            </div>
          </div>
        </div>
      ))}
    </CardGrid>
  );
}

/** Subscription tab — the big gradient panel with plan + usage stats. */
export function SubscriptionSkeleton() {
  return (
    <div
      className="flex w-full max-w-6xl flex-col items-center rounded-2xl border-2 border-blue-100 bg-gradient-to-b from-blue-50 to-white p-8 shadow-2xl dark:border-blue-800 dark:from-[#16243a] dark:to-[#0a192f]"
      aria-hidden="true"
    >
      {/* Panel heading */}
      <Skeleton className="h-7 w-36 rounded-lg bg-blue-100 dark:bg-blue-900" />
      {/* Current plan */}
      <Skeleton className="mt-8 h-9 w-28" />
      <Skeleton className="mt-2 h-4 w-64" />

      {/* Plan stat cards */}
      <div className="mt-8 grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-5 shadow dark:border-gray-700 dark:bg-gray-900"
          >
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-4 h-6 w-20" />
            <Skeleton className="mt-4 h-2.5 w-full rounded-full" />
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="mt-8 flex flex-col gap-4 md:flex-row">
        <Skeleton className="h-11 w-48 rounded-md" />
        <Skeleton className="h-11 w-48 rounded-md" />
      </div>
    </div>
  );
}
