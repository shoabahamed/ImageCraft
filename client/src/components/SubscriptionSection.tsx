import React, { useEffect, useState } from "react";
import { useAuthContext } from "@/hooks/useAuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/utils/appClient";
import { Progress } from "@/components/ui/progress";
import axios from "axios";
import { redirect } from "react-router-dom";

const plans = [
  {
    name: "Free",
    key: "free",
    description: "All normal facilities included.",
    color: "from-blue-100 to-blue-50 dark:from-[#16243a] dark:to-[#0a192f]",
    border: "border-blue-200 dark:border-blue-800",
    price: "Free",
  },
  {
    name: "Pro",
    key: "pro",
    description: "300 Style Transfer & 300 Super Resolution compute per month.",
    color: "from-blue-200 to-blue-100 dark:from-blue-900 dark:to-blue-700",
    border: "border-blue-400 dark:border-blue-600",
    price: "$1/month",
  },
  {
    name: "Ultimate",
    key: "ultimate",
    description: "Infinite compute for Style Transfer & Super Resolution.",
    color: "from-blue-400 to-blue-200 dark:from-blue-700 dark:to-blue-400",
    border: "border-blue-600 dark:border-blue-400",
    price: "$5/month",
  },
];

type SUBSCRIPTION_TYPE = {
  subscriptionPlan: string;
  renewalDate: string;
  styleCompletion: number;
  superResCompletion: number;
};

const STYLE_TOTAL = 300;
const SUPERRES_TOTAL = 300;

const SubscriptionSection = () => {
  const { user } = useAuthContext();

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const [fetching, setFetching] = useState(true); // Add fetching state

  const [subScriptionData, setSubscriptionData] =
    useState<SUBSCRIPTION_TYPE | null>(null);

  useEffect(() => {
    const fetchSubscriptionInfo = async () => {
      try {
        if (user && user.token) {
          const res = await apiClient.get("/subscription_info", {
            headers: { Authorization: `Bearer ${user.token}` },
          });

          const {
            subscription_end,
            style_completion,
            upscale_completion,
            subscription_plan,
          } = res.data.data;
          setSubscriptionData({
            renewalDate: subscription_end,
            styleCompletion: style_completion,
            superResCompletion: upscale_completion,
            subscriptionPlan: subscription_plan,
          });
        }
      } catch {
        toast({ description: "Failed to fetch subscription info." });
      } finally {
        setFetching(false); // Set fetching to false after attempt
      }
    };
    fetchSubscriptionInfo();
  }, [user]);

  const upgradeSubscription = async (plan: string) => {
    setLoading(true);
    try {
      if (user) {
        const res = await apiClient.get(`/subscribe?plan=${plan}`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        window.location.href = res.data.url;
      } else {
        toast({ description: "You need to sign in first" });
      }
    } catch (error) {
      toast({ description: "Something went wrong: " + error });
    } finally {
      setLoading(false);
    }
  };

  const managleSubscription = async () => {
    setCancelLoading(true);
    try {
      if (user) {
        const res = await apiClient.get(`/manage_subscription`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });

        if (res.data.url) window.location.href = res.data.url;
      } else {
        toast({
          description: "You need to sign in first",
        });
      }
    } catch (error) {
      let message = error.message;
      if (axios.isAxiosError(error)) {
        message = error.response.data.message;
      }
      toast({
        variant: "destructive",
        description: message,
        duration: 8000,
      });
    }
  };

  if (!subScriptionData) return <h1>Loading</h1>;

  return (
    <div className="w-full flex justify-center items-end ">
      <div className="w-full max-w-6xl bg-gradient-to-b from-blue-50 to-white dark:from-[#16243a] dark:to-[#0a192f] rounded-2xl shadow-2xl border-2 border-blue-100 dark:border-blue-800 p-8 mb-8 flex flex-col items-center relative">
        {/* Cancel Subscription Button - Top Right */}
        {(subScriptionData.subscriptionPlan === "pro" ||
          subScriptionData.subscriptionPlan === "ultimate") && (
          <Button
            className="absolute top-6 right-6 bg-blue-600 hover:bg-blue-700 text-white z-10 font-semibold shadow"
            onClick={managleSubscription}
            disabled={cancelLoading}
            size="sm"
          >
            {cancelLoading ? "Loading..." : "Manage Subscription"}
          </Button>
        )}
        <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-200 mb-2">
          Subscription
        </h2>
        {/* Show loading screen while fetching subscription data */}
        {fetching ? (
          <div className="flex flex-col items-center justify-center py-16 w-full">
            <span className="text-lg text-blue-600 dark:text-blue-200 font-semibold mb-2">
              Loading subscription info...
            </span>
            <Progress
              value={60}
              className="w-1/2 max-w-xs h-2.5 rounded-full bg-blue-100 dark:bg-blue-950 [&>div]:bg-blue-500 [&>div]:rounded-full shadow"
            />
          </div>
        ) : !user ? (
          <div className="text-lg text-red-600 dark:text-red-400 font-semibold py-8">
            You need to log in first.
          </div>
        ) : subScriptionData ? (
          <>
            <div className="mb-6 w-full flex flex-col items-center">
              <span className="text-lg text-gray-700 dark:text-gray-200 mb-1">
                Current Plan:
              </span>
              <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-300 mb-2">
                {subScriptionData.subscriptionPlan.charAt(0).toUpperCase() +
                  subScriptionData.subscriptionPlan.slice(1)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {
                  plans.find((p) => p.key === subScriptionData.subscriptionPlan)
                    ?.description
                }
              </span>
            </div>

            {/* Plan details for Pro/Ultimate only */}
            {subScriptionData.subscriptionPlan !== "free" && (
              <div className="w-full flex flex-col md:flex-row justify-center gap-6 mb-6">
                <div className="flex-1 bg-white dark:bg-gray-900 rounded-xl shadow p-5 border border-blue-100 dark:border-blue-700 flex flex-col items-center">
                  <div className="text-blue-700 dark:text-blue-300 font-semibold mb-2">
                    Renewal Date
                  </div>
                  <div className="text-lg font-bold">
                    {subScriptionData.renewalDate}
                  </div>
                </div>
                {/* Style Transfer Progress */}
                <div className="flex-1 bg-white dark:bg-gray-900 rounded-xl shadow p-5 border border-blue-100 dark:border-blue-700 flex flex-col items-center">
                  <div className="text-blue-700 dark:text-blue-300 font-semibold mb-2">
                    Style Transfer
                  </div>
                  {subScriptionData.subscriptionPlan === "ultimate" ? (
                    <div className="w-full flex items-center justify-center h-full">
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-900 px-4 py-1 rounded-full shadow border border-blue-200 dark:border-blue-700">
                        Unlimited
                      </span>
                    </div>
                  ) : (
                    <div className="w-full flex items-center gap-2 mb-2">
                      <span className="text-xs text-gray-600 dark:text-gray-300 font-medium min-w-[60px] text-right">
                        {subScriptionData.styleCompletion} / {STYLE_TOTAL}
                      </span>
                      <Progress
                        value={Math.min(
                          (subScriptionData.styleCompletion / STYLE_TOTAL) *
                            100,
                          100
                        )}
                        className="flex-1 h-2.5 rounded-full bg-blue-100 dark:bg-blue-950 [&>div]:bg-blue-500 [&>div]:rounded-full shadow max-w-sm"
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[60px] text-left">
                        {STYLE_TOTAL}
                      </span>
                    </div>
                  )}
                </div>
                {/* Super Resolution Progress */}
                <div className="flex-1 bg-white dark:bg-gray-900 rounded-xl shadow p-5 border border-blue-100 dark:border-blue-700 flex flex-col items-center">
                  <div className="text-blue-700 dark:text-blue-300 font-semibold mb-2">
                    Super Resolution
                  </div>
                  {subScriptionData.subscriptionPlan === "ultimate" ? (
                    <div className="w-full flex items-center justify-center h-full">
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-900 px-4 py-1 rounded-full shadow border border-blue-200 dark:border-blue-700">
                        Unlimited
                      </span>
                    </div>
                  ) : (
                    <div className="w-full flex items-center gap-2 mb-2">
                      <span className="text-xs text-gray-600 dark:text-gray-300 font-medium min-w-[60px] text-right">
                        {subScriptionData.superResCompletion} / {SUPERRES_TOTAL}
                      </span>
                      <Progress
                        value={Math.min(
                          (subScriptionData.superResCompletion /
                            SUPERRES_TOTAL) *
                            100,
                          100
                        )}
                        className="flex-1 h-2.5 rounded-full bg-blue-100 dark:bg-blue-950 [&>div]:bg-blue-500 [&>div]:rounded-full shadow max-w-sm"
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[60px] text-left">
                        {SUPERRES_TOTAL}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Upgrade/Downgrade Buttons */}
            <div className="w-full flex flex-col md:flex-row justify-center gap-6 mt-2">
              {subScriptionData.subscriptionPlan === "free" && (
                <>
                  <Button
                    className="w-full md:w-auto"
                    onClick={() => upgradeSubscription("pro")}
                    disabled={loading}
                  >
                    Upgrade to Pro
                  </Button>
                  <Button
                    className="w-full md:w-auto"
                    onClick={() => upgradeSubscription("ultimate")}
                    disabled={loading}
                    variant="secondary"
                  >
                    Upgrade to Ultimate
                  </Button>
                </>
              )}
              {subScriptionData.subscriptionPlan === "pro" && (
                <Button
                  className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold"
                  onClick={() => upgradeSubscription("ultimate")}
                  disabled={loading}
                >
                  Upgrade to Ultimate
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="text-lg text-red-600 dark:text-red-400 font-semibold py-8">
            Failed to load subscription data.
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionSection;
