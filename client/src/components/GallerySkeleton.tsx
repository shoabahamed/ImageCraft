/**
 * Professional placeholder shown while gallery images are being fetched.
 * Mirrors the masonry layout of the real grid (CSS columns) and renders
 * pulsing tiles with varied aspect ratios so the shape matches what loads.
 */
const TILE_RATIOS = [
  "aspect-[3/4]",
  "aspect-square",
  "aspect-[4/5]",
  "aspect-[3/4]",
  "aspect-[3/5]",
  "aspect-[4/5]",
];

interface GallerySkeletonProps {
  /** Number of placeholder tiles to render. */
  count?: number;
}

export default function GallerySkeleton({
  count = 12,
}: GallerySkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4 mb-8"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="mb-4 break-inside-avoid">
          <div
            className={`w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800 ${TILE_RATIOS[i % TILE_RATIOS.length]}`}
            style={{ animationDelay: `${(i % 8) * 120}ms` }}
          />
        </div>
      ))}
    </div>
  );
}
