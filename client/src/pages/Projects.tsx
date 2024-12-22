import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/hooks/useAuthContext";
import apiClient from "@/utils/appClient";
import React, { useEffect, useState } from "react";

interface Project {
  _id: string;
  user_id: string;
  project_id: string;
  project_data: object;
}

const Projects = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();

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

  return <div>Projects</div>;
};

export default Projects;
