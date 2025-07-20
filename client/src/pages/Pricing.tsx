import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useEffect, useState } from "react";
import apiClient from "@/utils/appClient";
import PageFooter from "@/components/PageFooter";

const plans = [
  {
    name: "Free",
    description: "All normal facilities included.",
    features: [
      "Unlimited basic edits",
      "Access to all standard tools",
      "Community support",
    ],
    planKey: "free",
    color: "from-blue-100 to-blue-50 dark:from-[#16243a] dark:to-[#0a192f]",
    border: "border-blue-200 dark:border-blue-800",
    price: "Free",
  },
  {
    name: "Pro",
    description: "300 Style Transfer & 300 Super Resolution compute per month.",
    features: [
      "Everything in Free",
      "300 Style Transfer credits",
      "300 Super Resolution credits",
      "Priority support",
    ],
    planKey: "pro",
    color: "from-blue-200 to-blue-100 dark:from-blue-900 dark:to-blue-700",
    border: "border-blue-400 dark:border-blue-600",
    price: "$1/month",
  },
  {
    name: "Ultimate",
    description: "Infinite compute for Style Transfer & Super Resolution.",
    features: [
      "Everything in Pro",
      "Unlimited Style Transfer",
      "Unlimited Super Resolution",
      "Premium support",
    ],
    planKey: "ultimate",
    color: "from-blue-400 to-blue-200 dark:from-blue-700 dark:to-blue-400",
    border: "border-blue-600 dark:border-blue-400",
    price: "$5/month",
  },
];

const Pricing = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [currentPlan, setCurrentPlan] = useState("free");

  useEffect(() => {
    const fetchPlan = async () => {
      if (user && user.token) {
        try {
          const res = await apiClient.get("/subscription_info", {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          setCurrentPlan(res.data.data.subscription_plan || "free");
        } catch {
          setCurrentPlan("free");
        }
      } else {
        setCurrentPlan("free");
      }
    };
    fetchPlan();
  }, [user]);

  const upgradeSubscription = async (plan: string) => {
    try {
      if (user) {
        const res = await apiClient.get(`/subscribe?plan=${plan}`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        window.location.href = res.data.url;
      } else {
        toast({
          description: "You need to sign in first",
        });
      }
    } catch (error) {
      toast({
        description: "Something went wrong: " + error,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-[#05101c] dark:to-[#0a192f]">
      <Navbar />
      <div className=" flex flex-col items-center py-16 px-4 md:px-12 lg:px-32">
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700 dark:text-blue-200 mb-4 text-center">
          Choose Your Plan
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-12 text-center max-w-2xl">
          Unlock more power and creativity with Pro or Ultimate. Your current
          plan is{" "}
          <span className="font-bold text-blue-600 dark:text-blue-300">
            {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
          </span>
          .
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.planKey;
            return (
              <div
                key={plan.name}
                className={`flex flex-col items-center rounded-2xl shadow-lg p-8 bg-gradient-to-b ${plan.color} border-2 ${plan.border} transition-transform hover:-translate-y-1 hover:shadow-xl relative`}
              >
                {isCurrent && (
                  <span className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    Current Plan
                  </span>
                )}
                <h2 className="text-2xl font-bold mb-2 text-blue-700 dark:text-blue-200">
                  {plan.name}
                </h2>
                <div className="mb-2 text-lg font-semibold text-blue-600 dark:text-blue-300">
                  {plan.price}
                </div>
                <p className="mb-4 text-gray-700 dark:text-gray-300 text-center">
                  {plan.description}
                </p>
                <ul className="mb-6 text-gray-600 dark:text-gray-300 text-sm w-full max-w-xs mx-auto">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 mb-2">
                      <svg
                        className="w-5 h-5 text-blue-500 dark:text-blue-300"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M5 13l4 4L19 7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <Button
                    disabled
                    className={`w-full cursor-not-allowed border-2
                      ${
                        plan.planKey === "free"
                          ? "bg-blue-400 dark:bg-blue-700 text-white border-blue-400 dark:border-blue-700"
                          : "bg-white text-blue-700 border-blue-600 dark:bg-gray-100 dark:text-blue-700 dark:border-blue-400"
                      }
                    `}
                  >
                    Selected
                  </Button>
                ) : (
                  plan.planKey !== "free" && (
                    <Button
                      className="w-full"
                      onClick={() => upgradeSubscription(plan.planKey)}
                    >
                      Upgrade to {plan.name}
                    </Button>
                  )
                )}
              </div>
            );
          })}
        </div>
      </div>

      <PageFooter />
    </div>
  );
};

export default Pricing;
