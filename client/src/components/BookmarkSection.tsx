import { useAuthContext } from "@/hooks/useAuthContext";
import apiClient from "@/utils/appClient";
import React, { useEffect, useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ArrowDownToLine, Bookmark, Flag, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
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
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import SubmitRating from "./SubmitRating";

interface Project {
  _id: string;
  user_id: string;
  is_public: string;
  project_id: string;
  username: string;
  original_image_url: string;
  canvas_image_url: string;
  bookmarked: boolean;
  rating_count: number;
  total_rating: number;
  total_views: number;
  total_bookmark: number;
  project_name: string;
  created_at: Date;
  updated_at: Date;
}

const BookmarkSection = ({
  userId,
  setShowLoadingDialog,
}: {
  userId: string;
  setShowLoadingDialog: (value: boolean) => void;
}) => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const projectPerPage = 6;
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(projectPerPage);
  const [currentPageNo, setCurrentPageNo] = useState(1);
  const [pages, setPages] = useState<number[]>([1]);
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

  // Calculate average rating
  const calculateRating = (total: number, count: number) => {
    if (count === 0) return 0;
    return (total / count).toFixed(1);
  };

  const calculatePages = (totalProjects: number) => {
    const totalPages = Math.ceil(totalProjects / projectPerPage);
    // console.log(totalProjects);
    const temp: number[] = [];
    for (let i = 1; i <= totalPages; i++) {
      temp.push(i);
    }

    return temp;
  };

  useEffect(() => {
    const fetchBookMarks = async () => {
      try {
        const response = await apiClient.get(`/bookmark_projects/${userId}`, {
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
        console.log(sortedProjects);

        // console.log(response.data.data.projects);
      } catch (err) {
        setError("Failed to fetch bookmark projects");
        toast({
          description: "Failed to load bookmarked projects" + err,
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    // if (user) fetchProjects();
    // else setProjects([]);
    fetchBookMarks();
  }, [user]);

  useEffect(() => {
    const tempProjects = projects.filter(
      (project) =>
        project.project_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        project.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProjects(tempProjects);
    setPages(calculatePages(tempProjects.length));
    setCurrentPageNo(1);
  }, [searchQuery]);

  useEffect(() => {
    const eIndex = Math.max(currentPageNo * projectPerPage, 0);
    const sIndex = Math.min(eIndex - projectPerPage, projects.length);

    setStartIndex(sIndex);
    setEndIndex(eIndex);
  }, [currentPageNo]);

  // Handle download image
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

      setProjects(
        projects.filter((project) => project.project_id !== projectId)
      );
      setFilteredProjects(
        filteredProjects.filter((project) => project.project_id !== projectId)
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
    <div className="w-full flex flex-col space-y-4">
      <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-64 flex justify-between items-center">
          <input
            type="text"
            placeholder={`Search Projects...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <button
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => setShowLoadingDialog(true)}
        >
          Create Project
        </button>
      </div>
      {filteredProjects.length < 1 && (
        <h1 className="flex justify-center items-center text-3xl text-red-500">
          No bookmarks found
        </h1>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.slice(startIndex, endIndex).map((project) => (
          <div
            key={project.project_id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            {/* Project Image */}
            <div className="w-full relative">
              <img
                src={project.canvas_image_url}
                alt={project.project_name}
                className="w-full h-48 object-cover"
              />
              <ArrowDownToLine
                className="absolute top-2 right-2 z-10 w-6 h-6 p-1 bg-white bg-opacity-75 rounded-full text-blue-700 cursor-pointer hover:bg-opacity-100 transition-all"
                onClick={() =>
                  downloadImage(project.canvas_image_url, project.project_id)
                }
              />
            </div>

            {/* Project Content */}
            <div className="p-4">
              {/* Title and Rating */}
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-blue-800">
                  {project.project_name}
                </h3>
                <div className="flex items-center space-x-1">
                  <div className="flex items-center bg-yellow-50 rounded-md px-1.5 py-0.5">
                    <svg
                      className="w-3.5 h-3.5 text-yellow-500 mr-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-xs font-medium text-gray-800">
                      {calculateRating(
                        project.total_rating,
                        project.rating_count
                      )}
                    </span>
                  </div>
                  <div className="flex items-center bg-gray-100 rounded-md px-1.5 py-0.5">
                    <span className="text-xs font-medium text-gray-600">
                      {project.rating_count}{" "}
                      {project.rating_count === 1 ? "review" : "reviews"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Creator and Date */}
              <div className="flex items-center text-sm text-gray-500 mb-3">
                By
                <Link
                  to={`/profile/${project.user_id}`}
                  className="pl-1 underline text-blue-500 italic"
                >
                  {project.username}
                </Link>
                <span className="mx-2">•</span>
                <span>
                  {project.updated_at.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              {/* Stats and Actions */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                {/* Views */}
                <div className="flex items-center text-sm text-gray-500">
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

                {/* Rate, Bookmark & Report buttons */}
                <div className="flex space-x-2">
                  <button
                    className="text-blue-600 hover:text-blue-800"
                    onClick={() => {
                      setOpenRate(true);
                      setSelectedProjectId(project.project_id);
                      setSelectedProjectUserId(project.user_id);
                    }}
                  >
                    <Star className={`w-4 h-4 ${"fill-yellow-500"}`} />
                  </button>

                  {/* Bookmark button */}
                  <button
                    className="text-blue-600 hover:text-blue-800"
                    onClick={() =>
                      handleBookmark(project.project_id, project.bookmarked)
                    }
                  >
                    <Bookmark
                      className={`w-4 h-4 ${
                        project.bookmarked ? "fill-current " : "fill-none"
                      }`}
                    />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800"
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

export default BookmarkSection;
