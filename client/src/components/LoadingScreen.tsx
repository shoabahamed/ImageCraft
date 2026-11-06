interface LoadingScreenProps {
  text?: string;
  /**
   * Render with a translucent (see-through) backdrop instead of the solid
   * gradient. Used on the editor page during saving/processing so the canvas
   * stays visible underneath.
   */
  translucent?: boolean;
}

/**
 * Full-screen branded loader shown while the app restores the user session.
 * Must be rendered inside ThemeProvider so the `.dark` class is applied on
 * <html> before this paints (otherwise a dark-mode user sees a light flash).
 */
export default function LoadingScreen({
  text = "Loading...",
  translucent = false,
}: LoadingScreenProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={
        translucent
          ? "min-h-screen flex flex-col items-center justify-center bg-white/30 backdrop-blur-sm dark:bg-[#0a192f]/30 px-6"
          : "min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-[#05101c] dark:to-[#0a192f] px-6"
      }
    >
      {/* Logo framed by an animated ring */}
      <div className="relative mb-7 flex items-center justify-center">
        <span
          className="absolute h-28 w-28 animate-spin rounded-full border-4 border-blue-100 dark:border-blue-900/60 border-t-blue-600 dark:border-t-blue-400"
          aria-hidden="true"
        />
        <img
          src="/hero.png"
          alt=""
          className="h-16 w-16 animate-pulse object-contain"
        />
      </div>

      {/* Brand wordmark (matches Navbar) */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-3xl font-bold text-transparent dark:from-blue-400 dark:to-blue-300">
        Image Craft
      </div>

      <p className="mt-3 text-sm font-medium text-blue-600/80 dark:text-blue-300/70">
        {text}
      </p>
    </div>
  );
}
