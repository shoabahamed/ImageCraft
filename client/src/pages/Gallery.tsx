import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  ArrowUpDown,
  PlusCircle,
  Star,
  Flag,
  ArrowDownToLine,
  Filter,
  SlidersHorizontal,
  Bookmark,
  Download,
  ChevronRight,
  Shield,
  X,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/utils/appClient";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useDropzone } from "react-dropzone";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Link, useNavigate } from "react-router-dom";
import SubmitRating from "@/components/SubmitRating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import NewProjectBox from "@/components/NewProjectBox";
import { ProjectDownloadDialog } from "@/components/ProjectDownloadDialog";

interface Project {
  _id: string;
  user_id: string;
  is_public: string;
  project_id: string;
  username: string;
  project_data: object;
  project_logs: object;
  original_image_url: string;
  canvas_image_url: string;
  bookmarked: boolean;
  rating_count: number;
  total_rating: number;
  total_views: number;
  total_bookmark: number;
  original_image_shape: { width: number; height: number };
  final_image_shape: { width: number; height: number };
  download_image_shape: { width: number; height: number };
  project_name: string;
  filter_names: string[] | [];
  all_filters_applied: string[] | [];
  created_at: Date;
  updated_at: Date;
}

// interface Project {
//   _id: string;
//   user_id: string;
//   username: string;
//   project_id: string;
//   project_name: string;
//   canvas_image_url: string;
//   bookmarked: boolean;
//   rating_count: number;
//   total_rating: number;
//   total_views: number;
//   total_bookmark: number;
//   created_at: Date;
//   updated_at: Date;
// }

export default function Gallery() {
  // State management
  const { user } = useAuthContext();
  const { toast } = useToast();
  // const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  // const [ratingInProgress, setRatingInProgress] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openReport, setOpenReport] = useState(false);
  const [openRate, setOpenRate] = useState(false);
  const [selectedProjectUserId, setSelectedProjectUserId] = useState<
    string | null
  >(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );

  const [reportData, setReportData] = useState({ title: "", description: "" });

  const projectPerPage = 8;
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(projectPerPage);
  const [currentPageNo, setCurrentPageNo] = useState(1);
  const [pages, setPages] = useState<number[]>([1]);

  const sortTypes = [
    "Newest",
    "Highest Rated",
    "Most Viewed",
    "Alphabetical",
    "Bookmarked",
  ];

  // Add these new states after other state declarations
  const [openDownload, setOpenDownload] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await apiClient.get("/get_all_projects", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
        });
        const fetchedProjects = response.data.data.projects.map(
          (project: Project) => ({
            ...project,
            created_at: new Date(project.created_at),
            updated_at: new Date(project.updated_at),
          })
        );

        const sortedProjects = fetchedProjects.sort((a, b) => {
          return b.updated_at.getTime() - a.updated_at.getTime();
        });

        setProjects(sortedProjects);
        setFilteredProjects(sortedProjects);
        setPages(calculatePages(sortedProjects.length));
      } catch (err) {
        // setError("Failed to fetch projects");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    const eIndex = Math.max(currentPageNo * projectPerPage, 0);
    const sIndex = Math.min(eIndex - projectPerPage, projects.length);

    setStartIndex(sIndex);
    setEndIndex(eIndex);
  }, [currentPageNo]);

  // Handle search input changes
  useEffect(() => {
    const filtered = projects.filter(
      (project) =>
        project.project_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        project.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProjects(filtered);
    setPages(calculatePages(filtered.length));
    setCurrentPageNo(1);
  }, [searchQuery]);

  // Handle sorting changes
  useEffect(() => {
    const sorted = [...filteredProjects].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "date":
          comparison = a.updated_at.getTime() - b.updated_at.getTime();
          break;
        case "rating":
          const ratingA =
            a.rating_count > 0 ? a.total_rating / a.rating_count : 0;
          const ratingB =
            b.rating_count > 0 ? b.total_rating / b.rating_count : 0;
          comparison = ratingA - ratingB;
          break;
        case "views":
          comparison = a.total_views - b.total_views;
          break;
        case "name":
          comparison = a.project_name.localeCompare(b.project_name);
          break;
        case "bookmarked":
          comparison = a.total_bookmark - b.total_bookmark;
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    setFilteredProjects(sorted);
  }, [sortBy, sortDirection]);

  const calculatePages = (totalProjects: number) => {
    const totalPages = Math.ceil(totalProjects / projectPerPage);
    // console.log(totalProjects);
    const temp: number[] = [];
    for (let i = 1; i <= totalPages; i++) {
      temp.push(i);
    }

    return temp;
  };

  // Calculate average rating
  const calculateRating = (total: number, count: number) => {
    if (count === 0) return 0;
    return (total / count).toFixed(1);
  };

  // Handle download image
  const downloadImage = async (url: string, project: Project) => {
    setSelectedProject(project);
    setOpenDownload(true);
    try {
      // Update view count
      await apiClient.post(
        "/projects/update_views",
        { project_id: project.project_id, project_user_id: project.user_id },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      // Update local state to reflect new view count
      setProjects(
        projects.map((p) =>
          p.project_id === project.project_id
            ? { ...p, total_views: p.total_views + 1 }
            : p
        )
      );
    } catch (error) {
      console.error("Error updating views:", error);
    }
  };

  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const changeSortType = (index: number) => {
    {
      switch (index) {
        case 0:
          setSortBy("date");
          break;
        case 1:
          setSortBy("rating");
          break;
        case 2:
          setSortBy("views");
          break;
        case 3:
          setSortBy("name");
          break;
        case 4:
          setSortBy("bookmarked");
          break;
      }
    }
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      {/* Modern Header with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-900 dark:to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-black opacity-20 z-10"></div>
        </div>
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h1 className="text-4xl font-bold text-white mb-2">
                Creative Showcase
              </h1>
              <p className="text-blue-100 dark:text-blue-200 max-w-lg">
                Discover and explore stunning image edits from our creative
                community
              </p>
            </div>
            <NewProjectBox />
          </div>

          {/* Integrated Search Bar */}
          <div className="mt-8 max-w-3xl mx-auto">
            <div className="relative flex bg-white dark:bg-gray-800 rounded-full shadow-lg">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-4 py-3 rounded-full text-gray-700 dark:text-gray-200 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                placeholder="Search projects, creators, or techniques..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                className="flex items-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-6 rounded-full text-sm font-medium ml-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <div
        className={`bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          showFilters ? "max-h-44" : "max-h-0 overflow-hidden"
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="font-medium text-gray-700 dark:text-gray-300">
              Sort by:
            </div>
            <div className="flex flex-wrap gap-3">
              {sortTypes.map((option, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    (index === 0 && sortBy === "date") ||
                    (index === 1 && sortBy === "rating") ||
                    (index === 2 && sortBy === "views") ||
                    (index === 3 && sortBy === "name") ||
                    (index === 4 && sortBy === "Bookmarked")
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-medium"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => changeSortType(index)}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="ml-auto">
              <button
                className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={toggleSortDirection}
              >
                <ArrowUpDown className="h-4 w-4 mr-2" />
                {sortDirection === "asc" ? "Ascending" : "Descending"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Results Count */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-medium text-gray-800 dark:text-gray-200">
            {filteredProjects.length && searchQuery.length > 0
              ? `${filteredProjects.length} projects found`
              : ""}
          </h2>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {filteredProjects.slice(startIndex, endIndex).map((project) => (
            <div
              key={project.project_id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-700"
            >
              {/* Project Image */}
              <div className="relative w-full">
                <img
                  src={project.canvas_image_url}
                  alt={project.project_name}
                  className="w-full h-48 object-cover"
                />
                <ArrowDownToLine
                  className="absolute top-2 right-2 z-10 w-6 h-6 p-1 bg-white dark:bg-gray-800 bg-opacity-75 rounded-full text-blue-600 dark:text-blue-400 cursor-pointer hover:bg-opacity-100 transition-all"
                  onClick={() =>
                    downloadImage(project.canvas_image_url, project)
                  }
                />
              </div>

              {/* Project Content */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-blue-800 dark:text-blue-300">
                    {project.project_name}
                  </h3>
                  <div className="flex items-center space-x-1">
                    <div className="flex items-center bg-yellow-50 dark:bg-yellow-900/30 rounded-md px-1.5 py-0.5">
                      <svg
                        className="w-3.5 h-3.5 text-yellow-500 dark:text-yellow-400 mr-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                        {calculateRating(
                          project.total_rating,
                          project.rating_count
                        )}
                      </span>
                    </div>
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800/50 rounded-md px-1.5 py-0.5">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {project.rating_count}{" "}
                        {project.rating_count === 1 ? "review" : "reviews"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Creator and Date */}
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                  By
                  <Link
                    to={`/profile/${project.user_id}`}
                    className="pl-1 text-blue-500 dark:text-blue-400 hover:underline italic"
                  >
                    {project.username}
                  </Link>
                  <span className="mx-2">•</span>
                  <span>{project.updated_at.toLocaleDateString()}</span>
                </div>

                {/* Stats and Actions */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    {project.total_views}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      onClick={() => {
                        setOpenRate(true);
                        setSelectedProjectId(project.project_id);
                        setSelectedProjectUserId(project.user_id);
                      }}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          project.rating_count > 0
                            ? "fill-yellow-500 dark:fill-yellow-400"
                            : ""
                        }`}
                      />
                    </button>

                    <button
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      onClick={() =>
                        handleBookmark(project.project_id, project.bookmarked)
                      }
                    >
                      <Bookmark
                        className={`w-4 h-4 ${
                          project.bookmarked ? "fill-current" : "fill-none"
                        }`}
                      />
                    </button>

                    <button
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      onClick={() => {
                        setOpenReport(true);
                        setSelectedProjectId(project.project_id);
                        setSelectedProjectUserId(project.user_id);
                      }}
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-md mx-auto">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                No projects found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your search or filters to find what you're looking
                for.
              </p>
            </div>
          </div>
        )}

        {/* Pagination */}
        <Pagination className="flex justify-end p-7">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                className="cursor-pointer"
                onClick={() => {
                  setCurrentPageNo(Math.max(currentPageNo - 1, 1));
                }}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>

            {pages
              .slice(
                Math.max(currentPageNo - 2, 0),
                Math.min(currentPageNo + 1, pages.length)
              )
              .map((pageNo) => (
                <PaginationItem key={pageNo}>
                  <PaginationLink
                    onClick={() => setCurrentPageNo(pageNo)}
                    isActive={pageNo === currentPageNo}
                    className="cursor-pointer"
                  >
                    {pageNo}
                  </PaginationLink>
                </PaginationItem>
              ))}

            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                className="cursor-pointer"
                onClick={() => {
                  setCurrentPageNo(Math.min(currentPageNo + 1, pages.length));
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* Footer */}
      <footer className="bg-blue-900 dark:bg-gray-900 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 Creative Showcase. All rights reserved.</p>
        </div>
      </footer>

      {/* ... existing modals ... */}
      {/* Rate Modal */}
      <Dialog open={openRate} onOpenChange={setOpenRate}>
        <DialogTrigger asChild>
          <Button className="hidden"></Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center">
              Rate This Image
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
              Share your feedback by rating this image!
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6">
            <div className="flex justify-center">
              <SubmitRating
                rating={selectedRating}
                onRatingChange={setSelectedRating}
              />
            </div>
            <div className="mt-4 flex justify-center text-gray-600 dark:text-gray-400 text-sm">
              {selectedRating
                ? `You selected ${selectedRating} stars!`
                : "No rating yet."}
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition-colors duration-200"
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

      {/* download dialog */}

      <ProjectDownloadDialog
        project={selectedProject}
        open={openDownload}
        onOpenChange={setOpenDownload}
      />
    </div>
  );
}
