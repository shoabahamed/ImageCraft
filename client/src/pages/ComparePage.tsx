import React, { useEffect, useState } from "react";
import apiClient from "@/utils/appClient";
import { useLocation } from "react-router-dom"; // For route parameters
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/hooks/useAuthContext";

interface Project {
  original_image_url: string;
  canvas_image_url: string;
}

const CompareImagesPage: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthContext();
  const [project, setProject] = useState<Project | null>(null);
  const { toast } = useToast();

  const projectId = useLocation().state?.projectId;

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

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-semibold">Compare Images</h1>
      <div className="mt-6 flex justify-around">
        <div>
          <h2 className="text-lg font-semibold">Original Image</h2>
          <img
            src={project.original_image_url}
            alt="Original"
            className="max-w-full max-h-96"
          />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Canvas Image</h2>
          <img
            src={project.canvas_image_url}
            alt="Canvas"
            className="max-w-full max-h-96"
          />
        </div>
      </div>
    </div>
  );
};

export default CompareImagesPage;
