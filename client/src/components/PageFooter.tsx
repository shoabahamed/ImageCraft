import React from "react";

const PageFooter = () => {
  return (
    <footer className="w-full bg-blue-700 dark:bg-[#05101c] text-white dark:text-blue-200 py-8 px-4 mt-auto border-t border-blue-800 dark:border-blue-900 transition-colors duration-300">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <svg
            className="w-8 h-8 text-white dark:text-blue-200"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M8 12l2 2 4-4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-bold text-xl">ImageCraft</span>
        </div>
        <div className="text-sm text-blue-100 dark:text-blue-400">
          &copy; {new Date().getFullYear()} ImageCraft. All rights reserved.
        </div>
        <div className="flex gap-4">
          <a
            href="#"
            className="hover:underline text-blue-100 dark:text-blue-400"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="hover:underline text-blue-100 dark:text-blue-400"
          >
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
};

export default PageFooter;
