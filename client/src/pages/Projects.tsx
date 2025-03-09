import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/hooks/useAuthContext";
import apiClient from "@/utils/appClient";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react"; // Assuming you're using Lucide icons
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Project {
  _id: string;
  user_id: string;
  is_public: string;
  project_id: string;
  project_data: object;
  project_logs: string;
  original_image_url: string;
  canvas_image_url: string;
  original_image_shape: { width: number; height: number };
  final_image_shape: { width: number; height: number };
  rendered_image_shape: { width: number; height: number };
  image_scale: { scaleX: number; scaleY: number };
  project_name: string;
  created_at: Date;
  updated_at: Date;
}

const Projects: React.FC = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const projectPerPage = 4;
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(projectPerPage);
  const [currentPageNo, setCurrentPageNo] = useState(1);
  const [pages, setPages] = useState<number[]>([1]);

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
        const response = await apiClient.get("/get_projects", {
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
        // console.log(response.data.data.projects);
      } catch (err) {
        setError("Failed to fetch projects");
        console.error(err);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProjects();
    else setProjects([]);
  }, [user]);

  useEffect(() => {
    const tempProjects = projects.filter((project) =>
      project.project_name.toLowerCase().includes(searchQuery.toLowerCase())
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

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
      setCurrentPageNo(1);
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

  const downloadImage = (url: string) => {
    const newTab = window.open(url, "_blank");
    if (newTab) {
      newTab.focus();
    } else {
      toast({
        description: "Failed to open the image in a new tab.",
        duration: 3000,
      });
    }
  };

  const goToMainPage = (
    project_id: string,
    project_data: Object,
    project_logs: string,
    final_image_shape: object,
    rendered_image_shape: object,
    image_scale: object,
    project_name: string
  ) => {
    localStorage.setItem("CanvasId", project_id);
    localStorage.setItem("project_data", JSON.stringify(project_data));
    localStorage.setItem("project_logs", project_logs);
    localStorage.setItem("project_name", project_name);

    localStorage.setItem(
      "final_image_shape",
      JSON.stringify(final_image_shape)
    );
    localStorage.setItem(
      "rendered_image_shape",
      JSON.stringify(rendered_image_shape)
    );
    localStorage.setItem("image_scale", JSON.stringify(image_scale));
    navigate("/mainpage");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {/* Projects Title Section */}
      <div className="flex-1 flex flex-col gap-6 px-4 py-8">
        <div className="text-5xl font-extrabold text-center text-gray-800 mb-4">
          Projects
        </div>
        <input
          type="text"
          placeholder="Search by project name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 border rounded-md shadow-sm focus:ring focus:ring-gray-300"
        />

        {/* Projects Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProjects.slice(startIndex, endIndex).map((project) => (
            <Card
              key={project._id}
              className="relative w-full bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
            >
              {/* View Icon */}
              <div className="absolute top-2 right-2 z-10">
                <button
                  onClick={() =>
                    window.open(`/view_project/${project.project_id}`, "_blank")
                  }
                  className="p-2 bg-white rounded-full shadow-md hover:bg-gray-200 transition"
                  title="View Project"
                >
                  <Eye
                    className="w-5 h-5 text-gray-700"
                    onClick={() => downloadImage(project.canvas_image_url)}
                  />
                </button>
              </div>

              {/* Project Image */}
              <div
                className="relative cursor-pointer"
                onClick={() =>
                  goToMainPage(
                    project.project_id,
                    project.project_data,
                    project.project_logs,
                    project.final_image_shape,
                    project.rendered_image_shape,
                    project.image_scale,
                    project.project_name || "Untitled"
                  )
                }
              >
                <img
                  src={project.canvas_image_url}
                  alt={`Project ${project.project_id}`}
                  className="object-cover w-full h-64 rounded-t-xl"
                />
              </div>

              {/* Project Buttons */}
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <Button
                    size="sm"
                    variant="outline"
                    className="custom-button"
                    onClick={() =>
                      updateProjectVisibility(
                        project.project_id,
                        project.is_public !== "true"
                      )
                    }
                  >
                    {project.is_public === "true"
                      ? "Make Private"
                      : "Make Public"}
                  </Button>
                  <Button
                    size={"sm"}
                    className="custom-delete-button"
                    onClick={() => deleteProject(project.project_id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
    </div>
  );
};

export default Projects;
