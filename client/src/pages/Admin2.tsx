import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/utils/appClient";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/hooks/useAuthContext";
import {
  Trash,
  MessageCircle,
  CheckCircle,
  FileText,
  Upload,
} from "lucide-react";
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

// Define the Report type
interface Report {
  id: string;
  reporter_name: string;
  reporter_user_id: string;
  project_id: string;
  project_user_name: string;
  project_user_id: string;
  title: string;
  description: string;
  has_admin_response: string;
  status: "pending" | "resolved";
  created_at: string | null;
}

type StyleTemplate = {
  image_id: string;
  image_url: string;
  image_name: string;
};

const AdminPanel2: React.FC = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingReports, setPendingReports] = useState<Report[]>([]);
  const [resolvedReports, setResolvedReports] = useState<Report[]>([]);
  const [messageData, setMessageData] = useState({ title: "", message: "" });
  const [openMessage, setOpenMessage] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [styleImages, setStyleImages] = useState<StyleTemplate[] | []>([]);
  const [openStyleImageUpload, setOpenStyleImageUpload] = useState(false);
  const [imageName, setImageName] = useState("");
  const [imageFile, setImageFile] = useState<null | File>(null);

  useEffect(() => {
    const get_style_images = async () => {
      try {
        const response = await apiClient.get("/all_style_img", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
        });
        const images = response.data.data;
        setStyleImages(images);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
        toast({ description: "Failed to load reports", duration: 3000 });
      }
    };

    get_style_images();
  }, []);

  // Fetch reports from the backend

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await apiClient.get("/get_all_reports", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
        });
        const reports = response.data.data;
        console.log(reports);

        // Separate reports into pending and resolved based on their status
        setPendingReports(
          reports.filter((report: Report) => report.status === "pending")
        );
        setResolvedReports(
          reports.filter((report: Report) => report.status === "resolved")
        );
      } catch (error) {
        console.error("Failed to fetch reports:", error);
        toast({ description: "Failed to load reports", duration: 3000 });
      }
    };

    fetchReports();
  }, [toast, user?.token]);

  // Function to resolve a report
  const resolveReport = async (reportId: string) => {
    try {
      const response = await apiClient.post(
        "/resolve_report",
        {
          report_id: reportId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      const reportToResolve = pendingReports.find(
        (report) => report.id === reportId
      );
      if (reportToResolve) {
        setPendingReports(
          pendingReports.filter((report) => report.id !== reportId)
        );
        setResolvedReports([
          ...resolvedReports,
          { ...reportToResolve, status: "resolved" },
        ]);
      }
      toast({
        description: "Report resolved successfully!",
        className: "bg-green-500 text-gray-900",
        duration: 3000,
      });
    } catch (error) {
      toast({
        description: "Failed to resolve report.",
        className: "bg-green-500 text-gray-900",
        duration: 3000,
      });
      console.error(error);
    }
  };

  // Handle changes in the report form
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setMessageData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Function to delete a report
  const deleteReport = async (
    reportId: string,
    type: "pending" | "resolved"
  ) => {
    try {
      await apiClient.delete(`/delete_report/${reportId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });
      if (type === "pending") {
        setPendingReports(
          pendingReports.filter((report) => report.id !== reportId)
        );
      } else {
        setResolvedReports(
          resolvedReports.filter((report) => report.id !== reportId)
        );
      }
      toast({
        description: "Report deleted sucessfully",
        className: "bg-green-500 text-gray-900",
        duration: 3000,
      });
    } catch (error) {
      console.error("Failed to delete report:", error);
      toast({
        description: "Failed to delete report",
        className: "bg-green-500 text-gray-900",
        duration: 3000,
      });
    }
  };

  const goToComparePage = (projectId: string, reportId: string) => {
    // Open the Compare Images page in a new tab/window

    navigate("/admin/compare_img", { state: { projectId, reportId } });
  };

  const goToViewLogsPage = (projectId: string, reportId: string) => {
    // Open the Compare Images page in a new tab/window

    navigate("/admin/view_logs", { state: { projectId, reportId } });
  };

  const handleMessage = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page refresh

    if (!selectedReportId) {
      toast({
        description: "Report ID is missing.",
        duration: 3000,
      });
      return;
    }

    // Make the API call to submit the report
    try {
      const response = await apiClient.post(
        "/send_message",
        {
          reportId: selectedReportId, // Include the project_id
          title: messageData.title,
          message: messageData.message,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      toast({
        description: "Message sent successfully!",
        className: "bg-green-500 text-gray-900",
        duration: 3000,
      });
      setOpenMessage(false); // Close the dialog after submission
      setMessageData({ title: "", message: "" }); // Clear the form data
      setSelectedReportId(null); // Reset selected project
    } catch (error) {
      toast({
        description: "Failed to send message.",
        className: "bg-green-500 text-gray-900",
        duration: 3000,
      });
      console.error(error);
    }
  };

  const deleteStyleImage = async (imageId: string) => {
    try {
      await apiClient.delete(`/delete_style_img/${imageId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });
      setStyleImages(styleImages.filter((image) => image.image_id !== imageId));
      toast({
        description: "Style image deleted successfully",
        duration: 3000,
      });
    } catch (error) {
      toast({
        description: "Failed to delete style image" + error,
        duration: 3000,
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      setImageFile(event.target.files[0]);
    }
  };

  const handleStyleImageUpload = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      toast({ description: "Please select an image first.", duration: 3000 });
      return;
    }

    const formData = new FormData();
    formData.append("imageId", crypto.randomUUID());
    formData.append("styleImage", imageFile);
    formData.append("imageName", imageName);

    try {
      await apiClient.post("/add_style_img", formData, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      toast({
        description: "Style Image uploaded successfully successfull",
        duration: 3000,
      });
    } catch (error) {
      toast({ description: "Image upload failed." + error, duration: 3000 });
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-900 text-white">
      <div className="flex gap-4 border-b border-gray-700 pb-2">
        {["pending", "resolved", "style images"].map((tab) => (
          <button
            key={tab}
            className={`px-5 py-2.5 rounded-lg transition font-semibold text-white ${
              activeTab === tab
                ? "bg-blue-600 shadow-md"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid gap-6 mt-6 sm:grid-cols-2 lg:grid-cols-3">
        {activeTab === "resolved" &&
          resolvedReports.map((report) => (
            <div
              key={report.id}
              className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:shadow-2xl transition-all"
            >
              <h3 className="text-lg font-semibold text-blue-400">
                {report.title}
              </h3>
              <p className="text-sm text-gray-300 mt-2">{report.description}</p>
              <p className="text-xs text-gray-500 mt-2">
                Reported by {report.reporter_name} on{" "}
                {report.created_at
                  ? new Date(report.created_at).toLocaleString()
                  : "N/A"}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  className="flex items-center px-4 py-2 text-sm bg-red-500 hover:bg-red-400 rounded-lg shadow text-white transition-all"
                  onClick={() => deleteReport(report.id, "resolved")}
                >
                  <Trash size={16} className="mr-2" /> Delete
                </button>
              </div>
            </div>
          ))}
      </div>
      <div className="grid gap-6 mt-6 sm:grid-cols-2 lg:grid-cols-3">
        {activeTab === "pending" &&
          pendingReports.map((report) => (
            <div
              key={report.id}
              className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:shadow-2xl transition-all"
            >
              <h3 className="text-lg font-semibold text-blue-400">
                {report.title}
              </h3>
              <p className="text-sm text-gray-300 mt-2">{report.description}</p>
              <p className="text-xs text-gray-500 mt-2">
                Reported by {report.reporter_name} on{" "}
                {report.created_at
                  ? new Date(report.created_at).toLocaleString()
                  : "N/A"}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  className="flex items-center px-4 py-2 text-sm bg-blue-500 hover:bg-blue-400 rounded-lg shadow text-white transition-all"
                  onClick={() => goToComparePage(report.project_id, report.id)}
                >
                  <FileText size={16} className="mr-2" /> Compare
                </button>
                <button
                  className="flex items-center px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 rounded-lg shadow text-white transition-all"
                  onClick={() => goToViewLogsPage(report.project_id, report.id)}
                >
                  <FileText size={16} className="mr-2" /> View Logs
                </button>
                <Dialog open={openMessage} onOpenChange={setOpenMessage}>
                  <DialogTrigger asChild>
                    <button
                      className="flex items-center px-4 py-2 text-sm bg-yellow-500 hover:bg-yellow-400 rounded-lg shadow text-white transition-all"
                      onClick={() => {
                        setOpenMessage(true);
                        setSelectedReportId(report.id);
                      }}
                    >
                      <MessageCircle className="mr-2" size={16} /> Message
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Message To User</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleMessage}>
                      <div className="grid gap-4 py-4">
                        <div className="grid w-full gap-1.5">
                          <Label htmlFor="title">Message Title</Label>
                          <Input
                            placeholder="Write a short title"
                            id="title"
                            className="mt-2"
                            required
                            value={messageData.title}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="grid w-full gap-1.5">
                          <Label htmlFor="message">Message</Label>
                          <Textarea
                            placeholder="Write a short description"
                            id="message"
                            className="mt-2"
                            required
                            value={messageData.message}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Send</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
                <button
                  className="flex items-center px-4 py-2 text-sm bg-green-500 hover:bg-green-400 rounded-lg shadow text-white transition-all"
                  onClick={() => resolveReport(report.id)}
                >
                  <CheckCircle size={16} className="mr-2" /> Resolve
                </button>
              </div>
            </div>
          ))}
      </div>
      {activeTab === "style images" && (
        <div className="flex flex-col items-start">
          <div className="flex w-full justify-end">
            <button
              className=" px-6 py-3 bg-green-500 hover:bg-green-400 rounded-lg text-white flex items-center gap-2 shadow-md w-64 justify-center"
              onClick={() => {
                setOpenStyleImageUpload(true);
              }}
            >
              <Upload size={20} /> Add New Image
            </button>
          </div>

          {styleImages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl justify-center">
              {styleImages.map((image) => (
                <div
                  key={image.image_id}
                  className="bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700 flex flex-col items-center"
                >
                  <img
                    src={image.image_url}
                    alt={image.image_name}
                    className="w-full h-48 object-cover rounded-md shadow-md"
                  />
                  <p className="text-white mt-3 font-semibold text-center">
                    {image.image_name}
                  </p>
                  <button
                    className="mt-3 px-4 py-2 bg-red-500 hover:bg-red-400 rounded-md text-white flex items-center gap-2 w-full justify-center"
                    onClick={() => {
                      deleteStyleImage(image.image_id);
                    }}
                  >
                    <Trash size={16} /> Delete
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center text-lg">
              No style images available.
            </p>
          )}
        </div>
      )}

      <Dialog
        open={openStyleImageUpload}
        onOpenChange={setOpenStyleImageUpload}
      >
        <DialogTrigger asChild>
          <Button className="hidden"></Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white p-6 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Add New Style Image
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleStyleImageUpload}
            className="flex flex-col gap-4"
          >
            {/* Name Input */}
            <label className="text-sm font-medium">Image Name</label>
            <Input
              type="text"
              placeholder="Enter image name"
              value={imageName}
              onChange={(e) => setImageName(e.target.value)}
              className="border border-gray-600 bg-gray-800 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />

            {/* Image Upload */}
            <label className="text-sm font-medium">Upload Image</label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e)}
              className="border border-gray-600 bg-gray-800 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            {/* Submit Button */}
            <DialogFooter>
              <Button
                type="submit"
                className="bg-green-500 hover:bg-green-400 rounded-lg text-white px-6 py-2"
              >
                Submit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel2;
