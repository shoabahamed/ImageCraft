import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/hooks/useAuthContext";
import apiClient from "@/utils/appClient";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";

interface Project {
  _id: string;
  user_id: string;
  username: string;
  project_id: string;
  original_image_url: string;
  canvas_image_url: string;
}

const Gallery: React.FC = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [openReport, setOpenReport] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [selectedProjectUserId, setSelectedProjectUserId] = useState<
    string | null
  >(null);

  // State to store report form data
  const [reportData, setReportData] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await apiClient.get("/get_all_projects", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
        });
        console.log(response.data.data.projects);
        setProjects(response.data.data.projects);
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

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

  // Handle changes in the report form
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setReportData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Handle form submission for the report
  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page refresh

    if (!selectedProjectId) {
      toast({
        description: "Project ID is missing.",
        duration: 3000,
      });
      return;
    }

    // Make the API call to submit the report
    try {
      const response = await apiClient.post(
        "/submit_report",
        {
          project_id: selectedProjectId, // Include the project_id
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
      setOpenReport(false); // Close the dialog after submission
      setReportData({ title: "", description: "" }); // Clear the form data
      setSelectedProjectId(null); // Reset selected project
    } catch (error) {
      toast({
        description: "Failed to submit the report.",
        className: "bg-green-500 text-gray-900",
        duration: 3000,
      });
      console.error(error);
    }
  };

  return (
    <div className="max-h-screen min-w-full flex flex-col gap-3 ">
      <div className="text-4xl text-center text-zinc-400 py-6 underline">
        Gallery
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 px-4 py-4">
        {projects.map((project) => (
          <Card
            key={project._id}
            className="w-full mx-auto shadow-md rounded-lg hover:shadow-lg transition-shadow duration-300"
          >
            <CardContent className="p-2 flex flex-col items-center">
              <img
                src={project.canvas_image_url}
                alt={`Image for project ${project.project_id}`}
                className="object-contain w-full rounded-lg"
                style={{ aspectRatio: "4 / 3" }}
              />
              <CardDescription className="mt-4 text-sm text-gray-600">
                Created by:{" "}
                <span className="font-semibold">{project.username}</span>
              </CardDescription>

              <div className="mt-4 flex space-x-2 w-full">
                <Button
                  onClick={() => downloadImage(project.canvas_image_url)}
                  className="flex-1 text-sm"
                >
                  Download
                </Button>

                <Dialog open={openReport} onOpenChange={setOpenReport}>
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="flex-1 text-sm"
                      onClick={() => {
                        setOpenReport(true);
                        setSelectedProjectId(project.project_id); // Set the selected project ID
                        setSelectedProjectUserId(project.user_id);
                      }}
                    >
                      Report
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Report To Admin</DialogTitle>
                      <DialogDescription>
                        Review by admin might take time
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
                          <Label htmlFor="description">
                            Report Description
                          </Label>
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
                        <Button type="submit">Report</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
