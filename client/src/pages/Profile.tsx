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

type userInfo = {
  username: string;
  email: string;
  image_url: string;
};

export default function UserProfilePage() {
  const [activeTab, setActiveTab] = useState("projects");
  const { user } = useAuthContext();
  const { toast } = useToast();
  const { userId } = useParams();
  const [showLoadingDialog, setShowLoadingDialog] = useState(false);
  const [projectImageDataURL, setProjectImageDataURL] = useState(null);
  const [profileImageDataURL, setProfileImageDataURL] = useState(null);
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [avgRate, setAverageRate] = useState(0.0);
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<null | userInfo>(null);
  const [profileImageOpen, setProfileImageOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await apiClient.get(`/user_info/${userId}`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        setUserInfo(response.data.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUserInfo();
  }, [userId]);

  // Generate a default avatar based on username
  const getDefaultAvatar = (username) => {
    const name = username || "User";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=1E40AF&color=fff`;
  };

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
    if (!profileImageDataURL) return;

    setIsUploading(true);

    try {
      // Create FormData
      const formData = new FormData();

      // Convert dataURL to Blob
      const response = await fetch(profileImageDataURL);
      const blob = await response.blob();

      // Add file to FormData
      formData.append("profile_image", blob, "profile_image.jpg");

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
        // Update the userInfo state with the new image URL
        setUserInfo((prev) =>
          prev ? { ...prev, image_url: uploadResponse.data.image_url } : null
        );

        toast({
          title: "Success",
          description: "Profile image updated successfully",
          duration: 3000,
        });

        // Clear the profile image data URL and close the dialog
        setProfileImageDataURL(null);
        setProfileImageOpen(false);
      }
    } catch (error) {
      console.error("Error uploading profile image:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile image",
        duration: 3000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  //  code for handling image upload for project
  const onProjectImageDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = () => {
        const binaryStr = reader.result;
        setProjectImageDataURL(binaryStr);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onProjectImageDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
  });

  const handleImageUpload = (imageUrl: string) => {
    navigate("/mainpage", { state: { imageUrl } });
  };

  // Force image refresh by adding timestamp to URL
  const getImageUrl = (url) => {
    if (!url) return getDefaultAvatar(userInfo?.username);
    return url.includes("?")
      ? `${url}&t=${new Date().getTime()}`
      : `${url}?t=${new Date().getTime()}`;
  };

  return (
    <div className="bg-blue-50 min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-6xl p-4">
        {/* Enhanced Profile Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          {/* Banner */}
          <div className="h-32 bg-blue-600"></div>

          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row">
              {/* Avatar - positioned to overlap with banner */}
              <div className="-mt-16 mb-4 md:mb-0 flex justify-center md:justify-start">
                <div className="relative">
                  {userInfo && (
                    <img
                      src={
                        userInfo.image_url
                          ? getImageUrl(userInfo.image_url)
                          : getDefaultAvatar(userInfo.username)
                      }
                      alt={`${userInfo?.username || "User"}'s avatar`}
                      className="w-32 h-32 rounded-full object-cover bg-blue-100 border-4 border-white"
                      onError={(e) => {
                        // Fallback if image fails to load
                        e.currentTarget.src = getDefaultAvatar(
                          userInfo?.username
                        );
                      }}
                    />
                  )}
                  <button
                    className="right-2 bottom-12 bg-blue-600 rounded-full p-2 text-white absolute"
                    onClick={() => {
                      setProfileImageDataURL(null); // Clear previous data
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
                </div>
              </div>

              {/* User info and stats */}
              <div className="md:ml-6 flex flex-col text-center md:text-left flex-grow">
                <h1 className="text-2xl font-bold text-slate-800">
                  {userInfo?.username || "Loading..."}
                </h1>
                <p className="text-slate-600 mb-1">
                  {userInfo?.email || "Loading..."}
                </p>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-2">
                  {/* User stats - updated labels */}
                  <div className="flex justify-center md:justify-end space-x-6 mt-4 md:mt-0">
                    <div className="text-center">
                      <p className="font-bold text-blue-600">{totalProjects}</p>
                      <p className="text-xs text-slate-500">Projects</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-blue-600">{totalViews}</p>
                      <p className="text-xs text-slate-500">Views</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-blue-600">{avgRate}</p>
                      <p className="text-xs text-slate-500">Average Rating</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "projects"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-blue-500"
            }`}
            onClick={() => setActiveTab("projects")}
          >
            Projects
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "bookmarks"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-blue-500"
            }`}
            onClick={() => setActiveTab("bookmarks")}
          >
            Bookmarks
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "reports"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-blue-500"
            }`}
            onClick={() => setActiveTab("reports")}
          >
            Reports
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "notices"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-blue-500"
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
              setShowLoadingDialog={setShowLoadingDialog}
              setTotalProjects={setTotalProjects}
              setAverageRate={setAverageRate}
              setTotalViews={setTotalViews}
            />
          )}

          {/* Bookmark Cards */}
          {activeTab === "bookmarks" && (
            <BookmarkSection
              userId={userId}
              setShowLoadingDialog={setShowLoadingDialog}
            />
          )}

          {/* Reports Cards - No Create Project Button */}
          {activeTab === "reports" && <ReportSection userId={userId} />}

          {/* Notice cared section  */}
          {activeTab === "notices" && <NoticeSection userId={userId} />}
        </div>
      </div>

      {/* Profile Image Upload Dialog */}
      <Dialog open={profileImageOpen} onOpenChange={setProfileImageOpen}>
        <DialogContent className="sm:max-w-[500px] p-6 bg-white rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-gray-900 text-center">
              Update Profile Picture
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Upload a new profile picture. Square images work best.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center items-center">
            <div
              {...getProfileRootProps()}
              className="border-2 border-dashed border-blue-400 w-full max-w-sm p-6 rounded-lg flex flex-col items-center justify-center cursor-pointer transition hover:bg-blue-50"
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
                setProfileImageOpen(false);
              }}
              disabled={isUploading}
            >
              Cancel
            </button>
            {profileImageDataURL && (
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                onClick={handleProfileImageUpload}
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Save"}
              </button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Project Image Upload Dialog */}
      <Dialog open={showLoadingDialog} onOpenChange={setShowLoadingDialog}>
        <DialogTrigger asChild>
          <button className="hidden"></button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] p-6 bg-white rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-gray-900 text-center">
              Upload Image
            </DialogTitle>
          </DialogHeader>

          <div className="flex justify-center items-center">
            <div
              {...getRootProps()}
              className="border-2 border-dashed border-blue-400 w-full max-w-sm p-6 rounded-lg flex flex-col items-center justify-center cursor-pointer transition hover:bg-blue-50"
            >
              <input {...getInputProps()} />
              {projectImageDataURL ? (
                <img
                  src={projectImageDataURL}
                  alt="Uploaded Preview"
                  className="w-full h-auto rounded-lg shadow-md"
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
                    {isDragActive
                      ? "Drop the files here..."
                      : "Drag & drop an image here, or click to select one"}
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6 flex justify-center">
            {projectImageDataURL && (
              <button
                className="custom-button w-32"
                onClick={() => {
                  handleImageUpload(projectImageDataURL);
                }}
              >
                Upload
              </button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
