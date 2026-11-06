import React from "react";

const PageFooter = () => {
  return (
    <footer className="w-full bg-white dark:bg-gray-950 text-slate-600 dark:text-slate-200 py-8 px-4 mt-auto border-t border-gray-200 dark:border-gray-800 transition-colors duration-300 flex-end">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <svg
            className="w-8 h-8 text-blue-600 dark:text-blue-300"
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
        <div className="text-sm text-slate-500 dark:text-slate-400">
          &copy; {new Date().getFullYear()} ImageCraft. All rights reserved.
        </div>
        <div className="flex gap-4">
          <a
            href="#"
            className="hover:underline text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-white"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="hover:underline text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-white"
          >
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
};

export default PageFooter;
