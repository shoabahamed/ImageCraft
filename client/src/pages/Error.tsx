import React from "react";
import { useNavigate } from "react-router-dom";

const ErrorPage = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-[#05101c] dark:to-[#0a192f] transition-colors duration-300">
      <div className="bg-white dark:bg-[#16243a] rounded-2xl shadow-lg p-10 flex flex-col items-center border border-red-100 dark:border-red-900">
        <svg
          className="w-16 h-16 text-red-500 dark:text-red-300 mb-4"
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
            d="M12 8v4m0 4h.01"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h1 className="text-3xl font-bold text-red-700 dark:text-red-200 mb-2">
          Oops! Something went wrong.
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 text-center">
          We couldn't process your request. Please try again or return to the
          home page.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-8 py-3 bg-white hover:bg-red-50 text-red-700 font-semibold rounded-lg shadow-lg text-lg transition-all duration-300 border border-red-700 dark:bg-gray-900 dark:text-red-300 dark:border-red-400 dark:hover:bg-gray-800"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;
