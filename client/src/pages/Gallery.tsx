import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/hooks/useAuthContext";
import apiClient from "@/utils/appClient";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import {
  ArrowDownNarrowWideIcon,
  ArrowUpNarrowWideIcon,
  Eye,
  Heart,
} from "lucide-react"; // Import Lucide icons
import Rating from "@/components/Rating";
import SubmitRating from "@/components/SubmitRating";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Project {
  _id: string;
  user_id: string;
  username: string;
  project_id: string;
  original_image_url: string;
  canvas_image_url: string;
  bookmarked: boolean;
  rating_count: number;
  total_rating: number;
  total_views: number;
  total_bookmark: number;
  similar_score?: number;
}

const Gallery: React.FC = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openReport, setOpenReport] = useState(false);
  const [openRate, setOpenRate] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [selectedProjectUserId, setSelectedProjectUserId] = useState<
    string | null
  >(null);
  const [reportData, setReportData] = useState({ title: "", description: "" });

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);

  const [selectedFilter, setSelectedFilter] = useState<string>("rating");
  const [sortOrder, setSortOrder] = useState<string>("descending");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await apiClient.get("/get_all_projects", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
        });
        setProjects(response.data.data.projects);
        setFilteredProjects(response.data.data.projects);
        // console.log(response.data.data.projects);
      } catch (err) {
        setError("Failed to fetch projects");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProjects();
    } else {
      setProjects([]);
    }
  }, [user]);

  useEffect(() => {
    switch (selectedFilter) {
      case "rating":
        filteredProjects.sort((a, b) => {
          const aValue = calculateRating(a.total_rating, a.rating_count);
          const bValue = calculateRating(b.total_rating, b.rating_count);

          return sortOrder === "ascending" ? aValue - bValue : bValue - aValue;
        });
        break;
      case "totalviews":
        filteredProjects.sort((a, b) => {
          const aValue = a.total_views;
          const bValue = b.total_views;
          return sortOrder === "ascending" ? aValue - bValue : bValue - aValue;
        });
        break;
      case "bookmark":
        filteredProjects.sort((a, b) => {
          const aValue = a.total_bookmark;
          const bValue = b.total_bookmark;
          return sortOrder === "ascending" ? aValue - bValue : bValue - aValue;
        });
        break;
      default:
        filteredProjects.sort((a, b) => {
          const aValue = calculateRating(a.total_rating, a.rating_count);
          const bValue = calculateRating(b.total_rating, b.rating_count);

          return sortOrder === "ascending" ? aValue - bValue : bValue - aValue;
        });
        break;
    }
  }, [sortOrder, selectedFilter]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const downloadImage = async (url: string, projectId: string) => {
    // Open image in a new tab
    const newTab = window.open(url, "_blank");
    if (!newTab) {
      toast({
        description: "Failed to open the image in a new tab.",
        duration: 3000,
      });
      return;
    }

    try {
      // Send request to update total views in the backend
      await apiClient.post(
        "/projects/update_views",
        { project_id: projectId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
    } catch (error) {
      console.error("Error updating views:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setReportData((prev) => ({ ...prev, [id]: value }));
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProjectId) {
      toast({ description: "Project ID is missing.", duration: 3000 });
      return;
    }

    try {
      const response = await apiClient.post(
        "/submit_report",
        {
          project_id: selectedProjectId,
          project_user_id: selectedProjectUserId,
          title: reportData.title,
          description: reportData.description,
          reporter_name: user?.username,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      toast({
        description: "Report submitted successfully!",
        className: "bg-green-500 text-gray-900",
        duration: 3000,
      });
      setOpenReport(false);
      setReportData({ title: "", description: "" });
      setSelectedProjectId(null);
    } catch (error) {
      toast({
        description: "Failed to submit the report.",
        className: "bg-red-500 text-gray-900",
        duration: 3000,
      });
      console.error(error);
    }
  };

  const handleBookmark = async (projectId: string, bookmark: boolean) => {
    try {
      const response = await apiClient.post(
        "/projects/toggle_bookmark", // API endpoint to toggle bookmark
        {
          project_id: projectId,
          bookmark: !bookmark,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      toast({
        description: "Bookmark updated!",
        className: "bg-green-500 text-gray-900",
        duration: 3000,
      });
      // update the local state to reflect the new bookmark status
      setFilteredProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.project_id === projectId
            ? { ...project, bookmarked: !project.bookmarked }
            : project
        )
      );

      // Optionally update the local state to reflect the new bookmark status
      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.project_id === projectId
            ? { ...project, bookmarked: !project.bookmarked }
            : project
        )
      );
    } catch (err) {
      toast({
        description: "Failed to update bookmark.",
        className: "bg-red-500 text-gray-900",
        duration: 3000,
      });
      console.error(err);
    }
  };

  const calculateRating = (totalRating: number, ratingCount: number) => {
    const rating = Math.floor(totalRating / ratingCount);

    return rating;
  };

  const handleSubmitRating = async () => {
    if (!selectedProjectId || !selectedRating) {
      toast({
        description: "Please select a rating before submitting.",
        className: "bg-red-500 text-gray-900",
        duration: 3000,
      });
      return;
    }

    try {
      const response = await apiClient.post(
        "/projects/rate",
        {
          project_id: selectedProjectId,
          rating: selectedRating,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      toast({
        description: "Rating submitted successfully!",
        className: "bg-green-500 text-gray-900",
        duration: 3000,
      });
      setOpenRate(false);
    } catch (error) {
      toast({
        description: "Failed to submit rating.",
        className: "bg-red-500 text-gray-900",
        duration: 3000,
      });
      console.error(error);
    }
  };

  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter projects based on the search query
    if (query === "") {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter((project) =>
        project.username.toLowerCase().includes(query)
      );
      setFilteredProjects(filtered);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({ description: "Please select an image first.", duration: 3000 });
      return;
    }

    const formData = new FormData();
    formData.append("baseImage", selectedFile);

    try {
      const response = await apiClient.post(
        "image_proc/similar_image",
        formData,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      // Assuming response.data.similar_projects is an array of project IDs
      const similarProjectsWithScores = response.data.similar_projects;
      // Filter projects where the project_id is in similarProjectIds and map to include scores
      const filtered = projects
        .filter((project) =>
          similarProjectsWithScores.some(
            (similarProject) => similarProject.project_id === project.project_id
          )
        )
        .map((project) => {
          const similarProject = similarProjectsWithScores.find(
            (similarProject) => similarProject.project_id === project.project_id
          );
          return {
            ...project,
            similar_score: similarProject?.score || 0, // Attach score to the project
          };
        });

      // Sort the filtered projects by score in descending order
      const sortedProjects = filtered.sort(
        (a, b) => b.similar_score - a.similar_score
      );

      // Update filteredProjects with the sorted projects
      setFilteredProjects(sortedProjects);

      toast({
        description: "Filtered Image Search successfull",
        duration: 3000,
      });
    } catch (error) {
      toast({ description: "Image upload failed." + error, duration: 3000 });
    }
  };
  return (
    <div className="max-h-screen min-w-full flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col gap-6 px-4 py-8">
        {/* Gallery Title Section */}
        <div className="text-5xl font-extrabold text-center text-gray-800">
          Public Gallery
        </div>

        <div className="text-xl text-center text-gray-500 mb-2 italic">
          Explore creative works from various users in the gallery.
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4 p-4 rounded-lg shadow-sm">
          <div className="relative w-full sm:w-1/3">
            {/* Search Box with Upload Icon */}
            <Input
              type="text"
              placeholder="Search by username"
              value={searchQuery}
              onChange={(e) => handleSearch(e)}
              className="w-full border rounded-lg p-2 pr-10"
            />
          </div>

          {/* Filter and Sort */}
          <div className="flex items-center gap-4">
            {/* Filter by Rating */}
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-48 border rounded-sm p-2 flex items-center justify-between shadow-sm">
                {/* <SelectValue /> */}
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="release">All</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="bookmark">BookMark</SelectItem>
                <SelectItem value="totalviews">Views</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Order (Icons) */}
            <div className="flex items-center gap-2  p-2 rounded-lg shadow-sm">
              <button
                className={`p-2 rounded-full transition ${
                  sortOrder === "ascending"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => setSortOrder("ascending")}
              >
                <ArrowUpNarrowWideIcon size={20} />
              </button>
              <button
                className={`p-2 rounded-full transition ${
                  sortOrder === "descending"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => setSortOrder("descending")}
              >
                <ArrowDownNarrowWideIcon size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        {/* Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 px-4 py-4">
          {filteredProjects.map((project) => (
            <Card
              key={project._id}
              className="w-full mx-auto bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
            >
              <div className="relative">
                <img
                  src={project.canvas_image_url}
                  alt={`Image for project ${project.project_id}`}
                  className="object-cover w-full h-64 rounded-t-xl transition-all duration-300 transform hover:scale-105 pointer-events-none"
                />

                {/* Bookmark Icon - Top Left */}
                <div className="absolute top-4 left-4 bg-white p-2 rounded-full shadow-md opacity-80 hover:opacity-100 transition-opacity">
                  <Heart
                    size={20}
                    className={`cursor-pointer ${
                      project.bookmarked ? "fill-red-500" : "stroke-gray-700"
                    }`}
                    onClick={() =>
                      handleBookmark(project.project_id, project.bookmarked)
                    }
                  />
                </div>

                {/* View Image Icon - Top Right */}
                <div className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md opacity-80 hover:opacity-100 transition-opacity">
                  <Eye
                    className="text-gray-700 cursor-pointer"
                    size={20}
                    onClick={() =>
                      downloadImage(
                        project.canvas_image_url,
                        project.project_id
                      )
                    }
                  />
                </div>
              </div>

              {/* Card Content */}
              <CardContent className="p-4 flex flex-col gap-y-3">
                {/* Views & Rating Row */}
                <div className="flex justify-between items-center text-gray-600 text-sm">
                  {/* Total Views */}
                  <div className="flex items-center gap-1">
                    <Eye size={16} className="text-gray-500" />
                    <span>{project.total_views} Views</span>
                  </div>

                  {/* Rating */}
                  <Rating
                    rating={calculateRating(
                      project.total_rating,
                      project.rating_count
                    )}
                  />
                </div>

                {/* Creator & Actions Row */}
                <div className="flex justify-between items-center text-gray-800 font-semibold">
                  <span>Created by: {project.username}</span>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setOpenRate(true);
                        setSelectedProjectId(project.project_id);
                        setSelectedProjectUserId(project.user_id);
                      }}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Rate
                    </button>
                    <button
                      onClick={() => {
                        setOpenReport(true);
                        setSelectedProjectId(project.project_id);
                        setSelectedProjectUserId(project.user_id);
                      }}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Report
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Rate Modal */}
      <Dialog open={openRate} onOpenChange={setOpenRate}>
        <DialogTrigger asChild>
          <Button className="hidden"></Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] p-6 bg-white rounded-2xl shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800 text-center">
              Rate This Image
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 text-center mt-2">
              Share your feedback by rating this image! .
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6">
            <div className="flex justify-center">
              <SubmitRating
                rating={selectedRating} // Default to no rating initially
                onRatingChange={setSelectedRating}
              />
            </div>
            <div className="mt-4 flex justify-center text-gray-600 text-sm">
              {selectedRating
                ? `You selected ${selectedRating} stars!`
                : "No rating yet."}
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition"
              onClick={handleSubmitRating}
            >
              Submit Rating
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Modal */}
      <Dialog open={openReport} onOpenChange={setOpenReport}>
        <DialogTrigger asChild>
          <Button className="hidden"></Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Report to Admin</DialogTitle>
            <DialogDescription>
              Please provide the necessary information to help us review the
              report.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleReport}>
            <div className="grid gap-4 py-4">
              <div className="grid w-full gap-1.5">
                <Label htmlFor="title">Report Title</Label>
                <Input
                  placeholder="Write a short title"
                  id="title"
                  className="mt-2"
                  required
                  value={reportData.title}
                  onChange={handleChange}
                />
              </div>
              <div className="grid w-full gap-1.5">
                <Label htmlFor="description">Report Description</Label>
                <Textarea
                  placeholder="Write a short description"
                  id="description"
                  className="mt-2"
                  required
                  value={reportData.description}
                  onChange={handleChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Submit Report</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Gallery;
