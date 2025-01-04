import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import apiClient from "@/utils/appClient"; // API client setup for requests
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useNavigate } from "react-router-dom";
import { Trash, MessageCircle, CheckCircle, FileText } from "lucide-react"; // Corrected icon imports

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

const AdminPanel: React.FC = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pendingReports, setPendingReports] = useState<Report[]>([]);
  const [resolvedReports, setResolvedReports] = useState<Report[]>([]);

  const [openMessage, setOpenMessage] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // State to store report form data
  const [messageData, setMessageData] = useState({
    title: "",
    message: "",
  });

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

  return (
    <div className="min-h-screen p-8">
      <Tabs
        defaultValue="pending"
        className="bg-white rounded-lg shadow-lg p-6 w-full"
      >
        <TabsList className="grid w-full grid-cols-2 gap-4">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>

        <TabsContent
          value="pending"
          className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {pendingReports.length === 0 ? (
            <p className="text-gray-500">No pending reports at the moment.</p>
          ) : (
            pendingReports.map((report) => (
              <Card key={report.id} className="border rounded-lg shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-gray-800">
                    {report.title}
                  </CardTitle>

                  {/* Handling large report descriptions */}
                  <CardDescription className="text-sm text-gray-600 relative">
                    <div className="h-20 overflow-hidden">
                      <p>{report.description}</p>
                    </div>
                    {report.description.length > 100 && (
                      <button
                        className="absolute bottom-0 left-0 text-blue-600 text-sm hover:underline"
                        onClick={() => alert("Show full description")}
                      >
                        See more
                      </button>
                    )}
                  </CardDescription>

                  <p className="italic text-sm">
                    Reported by {report.reporter_name} <br />
                    Created At:{" "}
                    {report.created_at
                      ? new Date(report.created_at).toLocaleString()
                      : "N/A"}
                  </p>
                </CardHeader>
                <CardFooter className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    onClick={() =>
                      goToComparePage(report.project_id, report.id)
                    }
                  >
                    <FileText className="mr-2" size={16} /> Compare Images
                  </Button>
                  <Button
                    onClick={() =>
                      goToViewLogsPage(report.project_id, report.id)
                    }
                  >
                    <FileText className="mr-2" size={16} /> View Logs
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => resolveReport(report.id)}
                  >
                    <CheckCircle className="mr-2" size={16} /> Mark as Resolved
                  </Button>
                  <Dialog open={openMessage} onOpenChange={setOpenMessage}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => {
                          setOpenMessage(true);
                          setSelectedReportId(report.id);
                        }}
                      >
                        <MessageCircle className="mr-2" size={16} /> Message
                      </Button>
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
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent
          value="resolved"
          className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {resolvedReports.length === 0 ? (
            <p className="text-gray-500">No resolved reports yet.</p>
          ) : (
            resolvedReports.map((report) => (
              <Card key={report.id} className="border rounded-lg shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-gray-800">
                    {report.title}
                  </CardTitle>

                  {/* Handling large report descriptions */}
                  <CardDescription className="text-sm text-gray-600 relative">
                    <div className="h-20 overflow-hidden">
                      <p>{report.description}</p>
                    </div>
                    {report.description.length > 100 && (
                      <button
                        className="absolute bottom-0 left-0 text-blue-600 text-sm hover:underline"
                        onClick={() => alert("Show full description")}
                      >
                        See more
                      </button>
                    )}
                  </CardDescription>

                  <p className="italic text-sm">
                    Reported by {report.reporter_name} <br />
                    Created At:{" "}
                    {report.created_at
                      ? new Date(report.created_at).toLocaleString()
                      : "N/A"}
                  </p>
                </CardHeader>
                <CardFooter className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    variant="destructive"
                    onClick={() => deleteReport(report.id, "resolved")}
                  >
                    <Trash className="mr-2" size={16} /> Delete
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
