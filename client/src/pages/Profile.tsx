import ProjectSection from "@/components/ProjectSection";
import { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useDropzone } from "react-dropzone";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import BookmarkSection from "@/components/BookmarkSection";
import ReportSection from "@/components/ReportSection";
import apiClient from "@/utils/appClient";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/hooks/useAuthContext";
import NoticeSection from "@/components/NoticeSection";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SubscriptionSection from "@/components/SubscriptionSection";
import PageFooter from "@/components/PageFooter";

export default function UserProfilePage() {
  const [activeTab, setActiveTab] = useState("projects");
  const { user, dispatch } = useAuthContext();
  const { toast } = useToast();
  const { userId } = useParams();
  const [profileImageDataURL, setProfileImageDataURL] = useState(null);
  const [username, setUsername] = useState("");
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [avgRate, setAverageRate] = useState(0.0);
  const [profileImageOpen, setProfileImageOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Set username when dialog opens
  useEffect(() => {
    if (profileImageOpen && user?.username) {
      setUsername(user.username);
    }
  }, [profileImageOpen, user?.username]);

  // Handle image drop for profile picture
  const onProfileImageDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImageDataURL(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const {
    getRootProps: getProfileRootProps,
    getInputProps: getProfileInputProps,
    isDragActive: isProfileDragActive,
  } = useDropzone({
    onDrop: onProfileImageDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
  });

  // Handle profile image upload
  const handleProfileImageUpload = async () => {
    if (!profileImageDataURL && !username) return;

    setIsUploading(true);

    try {
      // Create FormData
      const formData = new FormData();

      // Add username to FormData if it's different from current username
      if (username !== user.username) {
        formData.append("username", username);
      }

      // Convert dataURL to Blob if we have an image
      if (profileImageDataURL) {
        const response = await fetch(profileImageDataURL);
        const blob = await response.blob();

        // Add file to FormData
        formData.append("profile_image", blob, "profile_image.jpg");
      }

      // Send to backend
      const uploadResponse = await apiClient.post(
        `/update_profile_image/${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: user?.token ? `Bearer ${user.token}` : undefined,
          },
        }
      );

      if (uploadResponse.data.success) {
        // Update the userInfo state with the new image URL and/or username
        const userData = {
          ...user,
          imageUrl: uploadResponse.data.image_url || user.imageUrl,
          username: uploadResponse.data.username || user.username,
        };
        dispatch({ type: "UPDATE", payload: userData });

        toast({
          title: "Success",
          description: "Profile updated successfully",
          duration: 3000,
        });

        // Clear the profile image data URL and close the dialog
        setProfileImageDataURL(null);
        setProfileImageOpen(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile",
        duration: 3000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className=" bg-gradient-to-b from-blue-50 to-white dark:from-[#05101c] dark:to-[#0a192f] dark:bg-gradient-to-b duration-300 min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-6xl p-4">
        {/* Enhanced Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6 border border-blue-100 dark:border-gray-700">
          {/* Banner with gradient */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700"></div>

          <div className="px-6 pb-6 dark:text-gray-100">
            <div className="flex flex-col md:flex-row">
              {/* Avatar with enhanced border */}
              <div className="-mt-16 mb-4 md:mb-0 flex justify-center md:justify-start">
                <div className="relative">
                  <Avatar className="w-32 h-32 rounded-full object-cover bg-blue-100 border-4 border-white dark:border-gray-800 shadow-lg">
                    <AvatarImage
                      src={user.imageUrl}
                      alt={user.username}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-blue-600 text-white">
                      {user.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {user.userId == userId && (
                    <button
                      className="right-2 bottom-12 bg-blue-600 hover:bg-blue-700 rounded-full p-2 text-white absolute transition-colors duration-200 shadow-lg"
                      onClick={() => {
                        setProfileImageDataURL(null);
                        setProfileImageOpen(true);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* User info with enhanced typography */}
              <div className="md:ml-6 flex flex-col text-center md:text-left flex-grow">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user?.username || "Loading..."}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-1">
                  {user?.email || "Loading..."}
                </p>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-2">
                  <div className="flex justify-center md:justify-end space-x-6 mt-4 md:mt-0">
                    <div className="text-center">
                      <p className="font-bold text-blue-600 dark:text-blue-400">
                        {totalProjects}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Projects
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-blue-600 dark:text-blue-400">
                        {totalViews}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Views
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-blue-600 dark:text-blue-400">
                        {avgRate || 0}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Average Rating
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Updated Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          {/* Update each tab button with similar styling pattern */}
          <button
            className={`py-2 px-4 font-medium transition-colors duration-200 ${
              activeTab === "projects"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-300"
            }`}
            onClick={() => setActiveTab("projects")}
          >
            Projects
          </button>
          <button
            className={`py-2 px-4 font-medium transition-colors duration-200 ${
              activeTab === "bookmarks"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-300"
            }`}
            onClick={() => setActiveTab("bookmarks")}
          >
            Bookmarks
          </button>

          <button
            className={`py-2 px-4 font-medium transition-colors duration-200 ${
              activeTab === "subscription"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-300"
            }`}
            onClick={() => setActiveTab("subscription")}
          >
            Subscription
          </button>
          <button
            className={`py-2 px-4 font-medium transition-colors duration-200 ${
              activeTab === "reports"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-300"
            }`}
            onClick={() => setActiveTab("reports")}
          >
            Reports
          </button>
          <button
            className={`py-2 px-4 font-medium transition-colors duration-200 ${
              activeTab === "notices"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-300"
            }`}
            onClick={() => setActiveTab("notices")}
          >
            Notices
          </button>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {/* Enhanced Project Cards Grid */}
          {activeTab === "projects" && (
            <ProjectSection
              userId={userId}
              setTotalProjects={setTotalProjects}
              setAverageRate={setAverageRate}
              setTotalViews={setTotalViews}
            />
          )}

          {/* Bookmark Cards */}
          {activeTab === "bookmarks" && <BookmarkSection userId={userId} />}

          {/* Bookmark Cards */}
          {activeTab === "subscription" && <SubscriptionSection />}

          {/* Reports Cards - No Create Project Button */}
          {activeTab === "reports" && <ReportSection userId={userId} />}

          {/* Notice cared section  */}
          {activeTab === "notices" && <NoticeSection userId={userId} />}
        </div>
      </div>
      <PageFooter />
      {/* Profile Image Upload Dialog */}
      <Dialog open={profileImageOpen} onOpenChange={setProfileImageOpen}>
        <DialogContent className="sm:max-w-[500px] p-6 bg-white rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-gray-900 text-center">
              Update Profile
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Update your profile information and picture. Square images work
              best.
            </DialogDescription>
          </DialogHeader>

          {/* Username input field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <div
              {...getProfileRootProps()}
              className="border-2 border-dashed border-blue-400 w-full px-6 py-8 rounded-lg flex flex-col items-center justify-center cursor-pointer transition hover:bg-blue-50"
            >
              <input {...getProfileInputProps()} />
              {profileImageDataURL ? (
                <img
                  src={profileImageDataURL}
                  alt="Profile Preview"
                  className="w-32 h-32 rounded-full object-cover shadow-md"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    height="50"
                    width="50"
                    className="text-blue-500"
                  >
                    <path d="M1 14.5C1 12.1716 2.22429 10.1291 4.06426 8.9812C4.56469 5.044 7.92686 2 12 2C16.0731 2 19.4353 5.044 19.9357 8.9812C21.7757 10.1291 23 12.1716 23 14.5C23 17.9216 20.3562 20.7257 17 20.9811L7 21C3.64378 20.7257 1 17.9216 1 14.5ZM16.8483 18.9868C19.1817 18.8093 21 16.8561 21 14.5C21 12.927 20.1884 11.4962 18.8771 10.6781L18.0714 10.1754L17.9517 9.23338C17.5735 6.25803 15.0288 4 12 4C8.97116 4 6.42647 6.25803 6.0483 9.23338L5.92856 10.1754L5.12288 10.6781C3.81156 11.4962 3 12.927 3 14.5C3 16.8561 4.81833 18.8093 7.1517 18.9868L7.325 19H16.675L16.8483 18.9868ZM13 13V17H11V13H8L12 8L16 13H13Z" />
                  </svg>
                  <p className="mt-2 text-sm">
                    {isProfileDragActive
                      ? "Drop the image here..."
                      : "Drag & drop an image here, or click to select one"}
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6 flex justify-center gap-4">
            <button
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              onClick={() => {
                setProfileImageDataURL(null);
                setUsername(user.username);
                setProfileImageOpen(false);
              }}
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              onClick={handleProfileImageUpload}
              disabled={
                isUploading ||
                (!profileImageDataURL && username === user.username)
              }
            >
              {isUploading ? "Uploading..." : "Save"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
