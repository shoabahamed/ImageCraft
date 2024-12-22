import React, { useState, useEffect, useRef } from "react";
import { useAuthContext } from "@/hooks/useAuthContext";
import apiClient from "@/utils/appClient";
import * as fabric from "fabric";
import { Card, CardContent } from "@/components/ui/card";

interface Project {
  _id: string;
  user_id: string;
  project_id: string;
  project_data: object; // Serialized Fabric.js data
}

const Test = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<{ [key: string]: string }>({});
  const { user } = useAuthContext();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await apiClient.get("/get_projects", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`, // Include 'Bearer'
          },
        });
        setProjects(response.data.data.projects);
        console.log(response.data.data.projects);
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

  const renderCanvasPreview = async (projectId: string, canvasData: object) => {
    const canvasElement = canvasRef.current;

    if (!canvasElement) {
      return "";
    }

    const fabricCanvas = new fabric.Canvas(canvasElement);
    await new Promise<void>((resolve) => {
      fabricCanvas.loadFromJSON(canvasData, () => {
        fabricCanvas.renderAll();
        resolve();
      });
    });

    const previewUrl = canvasElement.toDataURL("image/png", 0.8);

    // Update the state with the preview URL for the given project ID
    setPreviewUrls((prevState) => ({
      ...prevState,
      [projectId]: previewUrl,
    }));
  };

  useEffect(() => {
    // Generate preview for each project once the projects are loaded
    projects.forEach((project) => {
      renderCanvasPreview(project._id, project.project_data);
    });
  }, [projects]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">Your Projects</h1>
      <div className="grid grid-cols-4 gap-6">
        {projects.map((project) => {
          // Access the preview URL for each project from the state
          const previewImage = previewUrls[project._id];

          return (
            <Card
              key={project._id}
              className="w-full h-64 cursor-pointer transition hover:shadow-lg"
            >
              <CardContent className="h-full flex items-center justify-center">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt={`Preview of ${project.project_id}`}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <div>Loading...</div> // Display loading message while preview is being generated
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Hidden offscreen canvas for rendering preview */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default Test;
