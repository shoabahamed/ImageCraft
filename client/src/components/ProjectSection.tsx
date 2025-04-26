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
import { ArrowDownToLine } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import NewProjectBox from "./NewProjectBox";
import { ProjectDownloadDialog } from "./ProjectDownloadDialog";

// TODO: I think I need to learn more about types usage when recieving and sending data between front end backend

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
  created_at: Date;
  updated_at: Date;
}

const ProjectSection = ({
  userId,
  setTotalProjects,
  setTotalViews,
  setAverageRate,
}: {
  userId: string;
  setTotalProjects: (value: number) => void;
  setTotalViews: (value: number) => void;
  setAverageRate: (value: number) => void;
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

  // Add these new states after other state declarations
  const [openDownload, setOpenDownload] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // const calculateRating = (totalRating: number, ratingCount: number) => {
  //   const rating = Math.floor(totalRating / ratingCount);

  //   return rating;
  // };

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
    const fetchProjects = async () => {
      try {
        const response = await apiClient.get(`/get_projects/${userId}`, {
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

        let totalViews = 0;
        let totalRating = 0;
        sortedProjects.map((project: Project) => {
          totalRating +=
            Number(project.total_rating) / Number(project.rating_count);

          totalViews += Number(project.total_views) || 0;
        });

        setTotalProjects(sortedProjects.length);
        setTotalViews(totalViews);
        setAverageRate(
          Number((totalRating / sortedProjects.length).toFixed(2))
        );

        setProjects(sortedProjects);
        setFilteredProjects(sortedProjects);
        setPages(calculatePages(sortedProjects.length));

        // console.log(response.data.data.projects);
      } catch (err) {
        // setError("Failed to fetch projects");

        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // if (user) fetchProjects();
    // else setProjects([]);
    fetchProjects();
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
  const downloadImage = async (url: string, project: Project) => {
    setSelectedProject(project);
    setOpenDownload(true);
    try {
      // Update view count
      await apiClient.post(
        "/projects/update_views",
        { project_id: project.project_id },
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

  const updateProjectVisibility = async (
    projectId: string,
    isPublic: boolean
  ) => {
    try {
      await apiClient.post(
        "/projects/update_visibility",
        { projectId, isPublic },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );

      toast({
        description: isPublic
          ? "Project made public successfully"
          : "Project made private successfully",
        className: "bg-green-500 text-gray-900",
      });

      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.project_id === projectId
            ? { ...project, is_public: isPublic ? "true" : "false" }
            : project
        )
      );
      setFilteredProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.project_id === projectId
            ? { ...project, is_public: isPublic ? "true" : "false" }
            : project
        )
      );
    } catch (error) {
      toast({
        description: `Failed to make project ${
          isPublic ? "public" : "private"
        }`,
        className: "bg-red-500 text-white",
      });
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      await apiClient.delete(`/delete_project/${projectId}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      setProjects(
        projects.filter((project) => project.project_id !== projectId)
      );
      setFilteredProjects(
        filteredProjects.filter((project) => project.project_id !== projectId)
      );
      // setCurrentPageNo(1);
      toast({
        description: "Project deleted successfully.",
        className: "bg-green-500 text-gray-900",
      });
    } catch {
      toast({
        description: "Failed to delete project.",
        className: "bg-red-500 text-gray-900",
      });
    }
  };

  const goToMainPage = (
    project_id: string,
    project_data: Object,
    project_logs: Object,
    original_image_shape: object,
    final_image_shape: object,
    download_image_shape: object,
    filter_names: string[] | [],
    project_name: string,
    imageUrl: string
  ) => {
    localStorage.setItem("CanvasId", project_id);
    localStorage.setItem("project_data", JSON.stringify(project_data));
    localStorage.setItem("project_logs", JSON.stringify(project_logs));
    localStorage.setItem("project_name", project_name);

    localStorage.setItem(
      "final_image_shape",
      JSON.stringify(final_image_shape)
    );
    localStorage.setItem(
      "original_image_shape",
      JSON.stringify(original_image_shape)
    );
    localStorage.setItem(
      "download_image_shape",
      JSON.stringify(download_image_shape)
    );
    localStorage.setItem("filter_names", JSON.stringify(filter_names));
    navigate("/mainpage", { state: { imageUrl } });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* Search and New Project Section */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-64 flex justify-between items-center">
          <input
            type="text"
            placeholder="Search Projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-gray-200 dark:border-gray-700 pl-10 pr-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
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
        <NewProjectBox />
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.slice(startIndex, endIndex).map((project) => (
          <div
            key={project.project_id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-700"
          >
            <div className="w-full relative">
              <img
                src={project.canvas_image_url}
                alt={project.project_name}
                className="w-full h-48 object-cover"
              />
              <ArrowDownToLine
                className="absolute top-2 right-2 z-10 w-6 h-6 p-1 bg-white dark:bg-gray-800 bg-opacity-75 rounded-full text-blue-600 dark:text-blue-400 cursor-pointer hover:bg-opacity-100 transition-all"
                onClick={() => downloadImage(project.canvas_image_url, project)}
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

                {/* Action buttons */}
                <div className="flex space-x-2">
                  {/* Public/Private toggle */}
                  <button
                    className={`text-xs px-2 py-1 rounded flex items-center cursor-default ${
                      project.is_public == "true"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {project.is_public === "true" ? (
                      <>
                        <svg
                          className="w-3 h-3 mr-1"
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
                        Public
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                        Private
                      </>
                    )}
                  </button>

                  {project.project_data && (
                    <>
                      <button
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        onClick={() =>
                          goToMainPage(
                            project.project_id,
                            project.project_data,
                            project.project_logs,
                            project.original_image_shape,
                            project.final_image_shape,
                            project.download_image_shape,
                            project.filter_names,
                            project.project_name || "Untitled",
                            project.original_image_url
                          )
                        }
                      >
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
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>

                      {/* Delete button */}
                      <button
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        onClick={() => deleteProject(project.project_id)}
                      >
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Project Actions Footer */}
            {project.project_data && (
              <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                <button
                  className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
                  onClick={() => {
                    navigate(`/log_dashboard/${project.project_id}`);
                  }}
                >
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Dashboard
                </button>

                <button
                  className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
                  onClick={() =>
                    updateProjectVisibility(
                      project.project_id,
                      project.is_public !== "true"
                    )
                  }
                >
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
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                  {project.is_public == "true" ? "Protect" : "Share"}
                </button>
              </div>
            )}
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

      <ProjectDownloadDialog
        project={selectedProject}
        open={openDownload}
        onOpenChange={setOpenDownload}
      />
    </div>
  );
};

export default ProjectSection;
