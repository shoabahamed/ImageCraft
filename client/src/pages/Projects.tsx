import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/hooks/useAuthContext";
import apiClient from "@/utils/appClient";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react"; // Assuming you're using Lucide icons
import Navbar from "@/components/Navbar";

interface Project {
  _id: string;
  user_id: string;
  is_public: string;
  project_id: string;
  project_data: object;
  original_image_url: string;
  canvas_image_url: string;
}

const Projects: React.FC = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await apiClient.get("/get_projects", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
        });
        setProjects(response.data.data.projects);
      } catch (err) {
        setError("Failed to fetch projects");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProjects();
    else setProjects([]);
  }, [user]);

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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col gap-6 px-4 py-8">
        {/* Projects Title Section */}
        <div className="text-5xl font-extrabold text-center text-gray-800 mb-8">
          Projects
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {projects.map((project) => (
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
              <div className="relative">
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
                    className="text-gray-600"
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
                    size="sm"
                    variant="destructive"
                    className="text-white bg-red-500 hover:bg-red-600"
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
    </div>
  );
};

export default Projects;
