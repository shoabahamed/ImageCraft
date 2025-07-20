import React from "react";

const LoadingBox = ({ text = "Loading..." }: { text?: string }) => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-opacity-80  z-50">
      <div className="flex flex-col items-center">
        <svg
          className="animate-spin h-12 w-12 text-blue-500 dark:text-blue-400 mb-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
        <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          {text}
        </span>
      </div>
    </div>
  );
};

export default LoadingBox;
