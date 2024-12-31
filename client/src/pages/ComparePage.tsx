import React, { useEffect, useState } from "react";
import apiClient from "@/utils/appClient";
import { useLocation } from "react-router-dom"; // For route parameters
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/hooks/useAuthContext";
import { Button } from "@/components/ui/button";

interface Project {
  original_image_url: string;
  canvas_image_url: string;
  project_data: string;
}

const CompareImagesPage: React.FC = () => {
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
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Section: Images */}
        <div className="flex flex-col w-full lg:w-1/2 space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Original Image</h2>
            <img
              src={project.original_image_url}
              alt="Original"
              className="w-full max-h-96 object-contain border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Canvas Image</h2>
            <img
              src={project.canvas_image_url}
              alt="Canvas"
              className="w-full max-h-96 object-contain border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Right Section: Project Data */}
        <div className="w-full lg:w-1/2 flex flex-col  h-[90vh]">
          <div className="bg-gray-100 p-4 rounded-md shadow-md flex-1 overflow-auto">
            <h2 className="text-lg font-semibold mb-2">Project Data</h2>
            <pre className="text-sm">
              {JSON.stringify(project.project_data, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareImagesPage;
