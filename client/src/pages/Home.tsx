import { Link } from "react-router-dom";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import NewProjectBox from "@/components/NewProjectBox";
import PageFooter from "@/components/PageFooter";

const features = [
  {
    title: "Enhance",
    description:
      "Enhance and transform your images with advanced AI tools for upscaling more.",
    icon: (
      <svg
        className="w-8 h-8 text-blue-500 dark:text-blue-300"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 16h-1v-4h-1m4 4h1a2 2 0 002-2v-2a2 2 0 00-2-2h-1m-4 0H7a2 2 0 00-2 2v2a2 2 0 002 2h1"
        />
      </svg>
    ),
  },
  {
    title: "Style Transfer",
    description:
      "Apply artistic styles to your photos and create unique artwork in just a clicks.",
    icon: (
      <svg
        className="w-8 h-8 text-pink-500 dark:text-pink-300"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    title: "Real Time Control",
    description:
      "Instantly improve brightness, contrast, and clarity with smart filters.",
    icon: (
      <svg
        className="w-8 h-8 text-yellow-500 dark:text-yellow-300"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M6.05 17.95l-1.414 1.414m12.728 0l-1.414-1.414M6.05 6.05L4.636 4.636"
        />
      </svg>
    ),
  },
  {
    title: "Share",
    description: "Easily share your creations with others.",
    icon: (
      <svg
        className="w-8 h-8 text-green-500 dark:text-green-300"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
  },
];

const Home = () => {
  const { user } = useAuthContext();

  useEffect(() => {
    localStorage.removeItem("project_data");
    localStorage.removeItem("canvasId");
    localStorage.removeItem("project_logs");
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {/* Hero Section */}
      <section className="flex flex-col-reverse md:flex-row flex-grow items-center justify-center px-6 md:px-12 lg:px-24 py-16 gap-8 md:gap-0 bg-gradient-to-b from-blue-50 to-white dark:from-[#05101c] dark:to-[#0a192f] dark:bg-gradient-to-b duration-300">
        {/* Left: Text Content */}
        <div className="flex-1 flex flex-col justify-center items-start text-left md:pr-12 space-y-4 md:space-y-6">
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-200">
            Welcome to ImageCraft
          </h1>
          <p className="text-xl font-medium text-blue-600 dark:text-blue-300">
            Unleash Creativity. Style, Enhance, and Share.
          </p>
          <p className="text-base leading-relaxed font-light max-w-2xl text-gray-700 dark:text-gray-300">
            ImageCraft is your all-in-one web platform for AI-powered image
            editing and creative design. Effortlessly enhance, stylize, and
            transform your visuals—whether you're a professional or a hobbyist.
            Discover powerful tools, intuitive workflows, and seamless sharing
            to bring your ideas to life.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <NewProjectBox buttonText="Get Started" />

            <Link to="/gallery">
              <button className="px-8 py-3 bg-white hover:bg-gray-50 text-blue-600 font-medium rounded-lg shadow-lg hover:shadow-gray-400/30 transition-all duration-300 border border-blue-200 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-700 dark:hover:bg-gray-700">
                Gallery
              </button>
            </Link>
          </div>
        </div>
        {/* Right: Hero Image */}
        <div className="flex-1 flex justify-center items-center mb-8 md:mb-0">
          <img
            src="/hero.png"
            alt="ImageCraft Hero"
            className="w-full max-w-md h-auto object-contain relative mix-blend-normal"
            style={{
              WebkitMaskImage:
                "linear-gradient(to bottom, white 85%, transparent 100%)",
              maskImage:
                "linear-gradient(to bottom, white 85%, transparent 100%)",
            }}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 px-4 md:px-12 lg:px-32 bg-white dark:bg-[#0a192f] transition-colors duration-300">
        <div className="max-w-6xl mx-auto text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-blue-700 dark:text-blue-200">
            What Can You Do with ImageCraft?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore a suite of powerful features designed to make your creative
            process seamless, fun, and professional.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center bg-blue-50 dark:bg-[#16243a] rounded-2xl shadow-md p-6 transition-transform hover:-translate-y-1 hover:shadow-xl border border-blue-100 dark:border-blue-900"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-blue-700 dark:text-blue-200">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Combined Call to Action & Pricing Section */}
      <section className="w-full py-16 px-4 md:px-12 lg:px-32 flex justify-center items-center transition-colors duration-300 bg-white dark:bg-[#0a192f]">
        <div className="max-w-2xl w-full flex flex-col items-center gap-6">
          {/* Creative Icon */}
          <div className="mb-2">
            <svg
              className="w-14 h-14 text-blue-500 dark:text-blue-300"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 48 48"
            >
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M16 32l8-16 8 16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="24" cy="24" r="4" fill="currentColor" />
            </svg>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-blue-700 dark:text-blue-200 text-center">
            Ready to Create Something Amazing?
          </h2>
          <div className="text-base md:text-lg text-blue-600 dark:text-blue-300 font-medium text-center -mt-2">
            Unleash your creativity with AI-powered tools.
          </div>
          <p className="text-lg text-gray-700 dark:text-gray-300 text-center">
            Curious about our plans? Take a look at our prices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full mt-2">
            <NewProjectBox
              buttonText="Start Edit"
              extraStyles="w-full sm:w-auto px-8 py-3 bg-white hover:bg-blue-50 text-blue-700 font-semibold rounded-lg shadow-lg text-lg transition-all duration-300 border border-blue-700 dark:bg-gray-900 dark:text-blue-300 dark:border-blue-400 dark:hover:bg-gray-800"
            />
            <Link to="/pricing" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-3 bg-white hover:bg-blue-50 text-blue-700 font-semibold rounded-lg shadow-lg text-lg transition-all duration-300 border border-blue-700 dark:bg-gray-900 dark:text-blue-300 dark:border-blue-400 dark:hover:bg-gray-800">
                See Pricing
              </button>
            </Link>
          </div>
          {/* Feature Highlights */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-6">
            <div className="flex items-center gap-2">
              <svg
                className="w-6 h-6 text-blue-500 dark:text-blue-300"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 4v16m8-8H4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                AI-Powered Editing
              </span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-6 h-6 text-blue-500 dark:text-blue-300"
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
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Flexible Pricing
              </span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-6 h-6 text-blue-500 dark:text-blue-300"
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
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Instant Results
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <PageFooter />
    </div>
  );
};

export default Home;
