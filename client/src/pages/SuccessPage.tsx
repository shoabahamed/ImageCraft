import React, { useEffect } from "react";
import LoadingBox from "@/components/LoadingBox";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useToast } from "@/hooks/use-toast";

const SuccessPage = () => {
  const navigate = useNavigate();
  const { user, dispatch } = useAuthContext();
  const { toast } = useToast();

  useEffect(() => {
    // Parse the query parameters from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get("email");
    const token = urlParams.get("token");
    const role = urlParams.get("role");
    const username = urlParams.get("username");
    const userId = urlParams.get("userId");
    const imageUrl = urlParams.get("image_url");
    const subscriptionPlan = urlParams.get("subscription_plan");

    // If email and token are present, store them and clear the query string
    if (email && token && role && username) {
      const userData = {
        email,
        token,
        role,
        username,
        userId,
        imageUrl,
        subscriptionPlan,
      };
      localStorage.setItem("user", JSON.stringify(userData));
      dispatch({ type: "LOGIN", payload: userData });

      toast({
        description: "Login successful",
        className: "bg-green-500 text-gray-900",
        duration: 5000,
      });

      // Clear the query string from the URL
      window.history.replaceState({}, document.title, "/");
      console.log(user);
    }

    const timer = setTimeout(() => {
      // Example logic: redirect based on localStorage values
      const projectData = localStorage.getItem("project_data");
      if (projectData) {
        navigate("/mainpage"); // or any route you want
      } else {
        navigate("/");
      }
    }, 25000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-[#05101c] dark:to-[#0a192f] transition-colors duration-300">
      <div className="bg-white dark:bg-[#16243a] rounded-2xl shadow-lg p-10 flex flex-col items-center border border-blue-100 dark:border-blue-900">
        <svg
          className="w-16 h-16 text-green-500 dark:text-green-300 mb-4"
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
            d="M9 12l2 2 4-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-200 mb-2">
          Success!
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 text-center">
          Your action was completed successfully. Redirecting you now...
        </p>
        <div className="w-32">
          <LoadingBox text="" />
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
