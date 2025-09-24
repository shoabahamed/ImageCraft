import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  ArrowUpDown,
  Star,
  Flag,
  ArrowDownToLine,
  Bookmark,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { useSearchParams, Link } from "react-router-dom";
import apiClient from "@/utils/appClient";
import { useAuthContext } from "@/hooks/useAuthContext";
import NewProjectBox from "@/components/NewProjectBox";
import { ProjectDownloadDialog } from "@/components/ProjectDownloadDialog";
import { useToast } from "@/hooks/use-toast";
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
import SubmitRating from "@/components/SubmitRating";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import LoadingBox from "@/components/LoadingBox";
import PageFooter from "@/components/PageFooter";
import axios from "axios";

const sortTypes = [
  { label: "Newest", value: "date" },
  { label: "Highest Rated", value: "rating" },
  { label: "Most Viewed", value: "views" },
  { label: "Alphabetical", value: "name" },
  { label: "Bookmarked", value: "bookmarked" },
];

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

export default function Gallery() {
  // URL search params
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuthContext();
  const inputRef = useRef<HTMLInputElement>(null);

  // State initialized from URL
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [searchInput, setSearchInput] = useState(searchQuery); // Local input state
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "date");
  const [sortDirection, setSortDirection] = useState(
    searchParams.get("dir") || "desc"
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );

  // Data state
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]); // Array of project objects
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

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

  // Add these new states after other state declarations
  const [openDownload, setOpenDownload] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    console.log("refreshed");
    localStorage.removeItem("canvasId");
  }, []);

  // Update URL when state changes
  useEffect(() => {
    setSearchParams({
      search: searchQuery,
      sort: sortBy,
      dir: sortDirection,
      page: String(currentPage),
    });
    // eslint-disable-next-line
  }, [searchQuery, sortBy, sortDirection, currentPage]);

  // Fetch when URL changes
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const params = {
          search: searchParams.get("search") || "",
          sort: searchParams.get("sort") || "date",
          dir: searchParams.get("dir") || "desc",
          page: searchParams.get("page") || "1",
          page_size: 8,
        };
        const response = await apiClient.get("/projects/query", {
          params,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
        });
        const data = response.data.data;
        setProjects(
          (data.projects || []).map((project: any) => ({
            ...project,
            created_at: new Date(project.created_at),
            updated_at: new Date(project.updated_at),
          }))
        );
        setTotalPages(data.total_pages || 1);
        setTotalCount(data.total || 0);
      } catch {
        setProjects([]);
        setTotalPages(1);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
    // eslint-disable-next-line
  }, [searchParams.toString(), user?.token]);

  // Handlers
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }
  };

  const handleSearchIconClick = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
    // If input is empty, force update the URL/search params
    if (!searchInput) {
      setSearchParams({
        search: "",
        sort: sortBy,
        dir: sortDirection,
        page: "1",
      });
    }
    if (inputRef.current) inputRef.current.focus();
  };

  const handleSortType = (index: number) => {
    setSortBy(sortTypes[index].value);
    setCurrentPage(1);
  };

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Pagination logic for ellipsis
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, -1, totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          -1,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          -1,
          currentPage - 1,
          currentPage,
          currentPage + 1,
          -1,
          totalPages
        );
      }
    }
    return pages;
  };

  // Calculate average rating
  const calculateRating = (total: number, count: number) => {
    if (!count) return 0;
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
        duration: 3000,
      });
      setOpenRate(false);
    } catch (error) {
      let message = error.message;
      if (axios.isAxiosError(error)) {
        message = error.response.data.message;
      }
      toast({
        description: "Failed to submit rating: " + message,
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
        duration: 3000,
      });
      // update the local state to reflect the new bookmark status
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-[#05101c] dark:to-[#0a192f]">
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
            <NewProjectBox extraStyles="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg hover:shadow-blue-500/50 transition-all duration-300 dark:bg-blue-500 dark:hover:bg-blue-600" />
          </div>

          {/* Integrated Search Bar */}
          <div className="mt-8 max-w-3xl mx-auto">
            <div className="relative flex bg-white dark:bg-gray-800 rounded-full shadow-lg">
              <Input
                ref={inputRef}
                type="text"
                className="block w-full pl-6 pr-12 py-3 rounded-full text-gray-700 dark:text-gray-200 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                placeholder="Search projects or creators..."
                value={searchInput}
                onChange={handleSearchInputChange}
                onKeyDown={handleSearchKeyDown}
              />
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                onClick={handleSearchIconClick}
                aria-label={searchInput ? "Search" : "Focus search"}
                type="button"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-all duration-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="font-medium text-gray-700 dark:text-gray-300">
              Sort by:
            </div>
            <div className="flex flex-wrap gap-3">
              {sortTypes.map((option, index) => (
                <button
                  key={option.value}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    sortBy === option.value
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-medium"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => handleSortType(index)}
                >
                  {option.label}
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
            {totalCount && searchQuery.length > 0
              ? `${totalCount} projects found`
              : ""}
          </h2>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 bg-gradient-to-b from-blue-50 to-white dark:from-[#05101c] dark:to-[#0a192f] dark:bg-gradient-to-b duration-300">
          {loading ? (
            <div className="col-span-full text-center text-blue-600 dark:text-blue-300 text-lg">
              Loading...
            </div>
          ) : projects.length === 0 ? (
            <div className="col-span-full text-center py-12">
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
                  Try adjusting your search or filters to find what you're
                  looking for.
                </p>
              </div>
            </div>
          ) : (
            projects.map((project) => (
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
            ))
          )}
        </div>

        {/* Pagination */}
        <Pagination className="flex justify-end p-7">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                className="cursor-pointer"
                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
              />
            </PaginationItem>
            {getPageNumbers().map((pageNo, idx) =>
              pageNo === -1 ? (
                <PaginationItem key={"ellipsis-" + idx}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={pageNo}>
                  <PaginationLink
                    onClick={() => handlePageChange(pageNo)}
                    isActive={pageNo === currentPage}
                    className="cursor-pointer"
                  >
                    {pageNo}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
            <PaginationItem>
              <PaginationNext
                className="cursor-pointer"
                onClick={() =>
                  handlePageChange(Math.min(currentPage + 1, totalPages))
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <PageFooter />
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
