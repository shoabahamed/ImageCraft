import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/hooks/useAuthContext";
import apiClient from "@/utils/appClient";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Project {
  _id: string;
  user_id: string;
  project_id: string;
  project_data: object;
  origial_image_url: string;
  canvas_image_url: string;
}

const Projects = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  // const BACKEND_URL = "http://127.0.0.1:5000";
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Replace the URL with your actual backend URL
        const response = await apiClient.get("/get_projects", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`, // Include 'Bearer'
          },
        });
        // Store the projects in state
        setProjects(response.data.data.projects);
        console.log(response.data.data.projects);
      } catch (err) {
        setError("Failed to fetch projects");
        console.error(err); // Log the error for debugging
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };

    // Call the fetchProjects function when the component mounts
    if (user) {
      fetchProjects();
    } else {
      setProjects([]);
    }
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const shareProject = (projectId) => {
    navigator.clipboard.writeText(`${BACKEND_URL}/projects/${projectId}`);
    toast({ description: "Project link copied to clipboard!", duration: 3000 });
  };

  const deleteProject = async (projectId) => {
    try {
      await apiClient.delete(`/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setProjects(
        projects.filter((project) => project.project_id !== projectId)
      );
      toast({ description: "Project deleted successfully.", duration: 3000 });
    } catch {
      toast({ description: "Failed to delete project.", duration: 3000 });
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="min-h-screen min-w-full flex flex-col gap-3">
      <div className="text-5xl text-center text-zinc-400 py-3 underline ">
        Projects
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-4 py-">
        {projects.map((project) => (
          <Card
            key={project._id}
            className="w-full max-w-xs mx-auto shadow-md rounded-lg hover:shadow-xl transition-shadow duration-300"
          >
            <CardContent className="p-4">
              <img
                src={project.canvas_image_url}
                alt={`Image for project ${project.project_id}`}
                className="object-cover w-full h-48 rounded-t-lg cursor-pointer"
              />
              <div className="flex justify-between mt-4">
                <Button onClick={() => shareProject(project.project_id)}>
                  Share
                </Button>
                <Button
                  className="bg-red-500 text-white hover:bg-red-600"
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
  );
};

export default Projects;
