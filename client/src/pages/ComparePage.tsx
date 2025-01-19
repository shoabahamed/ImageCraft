import React, { useEffect, useState } from "react";
import apiClient from "@/utils/appClient";
import { useLocation, useNavigate } from "react-router-dom"; // For route parameters
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/hooks/useAuthContext";

interface Project {
  original_image_url: string;
  canvas_image_url: string;
  project_data: string;
}

const CompareImagesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [project, setProject] = useState<Project | null>(null);
  const { toast } = useToast();

  const projectId = useLocation().state?.projectId;
  const reportId = useLocation().state?.reportId;

  // Fetch project images from backend
  useEffect(() => {
    const fetchProjectImages = async () => {
      try {
        const response = await apiClient.get(
          `/get_project_by_id/${projectId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user?.token}`,
            },
          }
        );
        setProject(response.data);
      } catch (error) {
        toast({
          description: "Failed to load project images.",
          className: "bg-red-500 text-gray-900",
          duration: 3000,
        });
        console.error(error);
      }
    };

    fetchProjectImages();
  }, [projectId, toast]);

  if (!project) {
    return <p>Loading...</p>;
  }

  const deleteProject = async (projectId: string, reportId: string) => {
    try {
      await apiClient.post(
        `/delete_report_project`,
        { projectId, reportId },
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      toast({
        description: "Project deleted successfully.",
        duration: 3000,
        className: "bg-green-500 text-gray-900",
      });

      navigate("/admin");
    } catch {
      toast({
        description: "Failed to delete project.",
        duration: 3000,
        className: "bg-red-500 text-gray-900",
      });
    }
  };

  return (
    <div className="min-h-screen p-8 bg-[hsl(var(--background))] text-[hsl(var(--foreground))] flex flex-col items-center">
      {/* Header Section */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-[hsl(var(--foreground))]">
          Compare Images
        </h1>
        <button
          onClick={() => deleteProject(projectId, reportId)}
          className="custom-delete-button"
        >
          Delete Project
        </button>
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-6xl">
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold text-[hsl(var(--muted-foreground))] mb-4">
            Original Image
          </h2>
          <div className="w-full bg-[hsl(var(--card))] p-4 rounded-lg shadow-md">
            <img
              src={project.original_image_url}
              alt="Original"
              className="w-full max-h-96 object-contain border border-[hsl(var(--border))] rounded-lg"
            />
          </div>
        </div>
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold text-[hsl(var(--muted-foreground))] mb-4">
            Modified Image
          </h2>
          <div className="w-full bg-[hsl(var(--card))] p-4 rounded-lg shadow-md">
            <img
              src={project.canvas_image_url}
              alt="Canvas"
              className="w-full max-h-96 object-contain border border-[hsl(var(--border))] rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareImagesPage;
