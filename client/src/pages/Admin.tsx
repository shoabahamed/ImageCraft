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

// Define the Report type
interface Report {
  id: string;
  reporter_user_id: string;
  project_id: string;
  project_user_id: string;
  title: string;
  description: string;
  status: "pending" | "resolved";
  created_at: string | null;
}

const AdminPanel: React.FC = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pendingReports, setPendingReports] = useState<Report[]>([]);
  const [resolvedReports, setResolvedReports] = useState<Report[]>([]);

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

  const goToComparePage = (projectId: string) => {
    // Open the Compare Images page in a new tab/window

    navigate("/admin/compare_img", { state: { projectId } });
  };

  const renderReportDetails = (report: Report) => (
    <div>
      <p>
        <strong>Reporter User ID:</strong> {report.reporter_user_id}
      </p>
      <p>
        <strong>Project ID:</strong> {report.project_id}
      </p>
      <p>
        <strong>Project User ID:</strong> {report.project_user_id}
      </p>
      <p>
        <strong>Created At:</strong>{" "}
        {report.created_at
          ? new Date(report.created_at).toLocaleString()
          : "N/A"}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen p-8">
      <Tabs
        defaultValue="pending"
        className="bg-white rounded-lg shadow-lg p-6 w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingReports.length === 0 ? (
            <p className="text-gray-500">No pending reports at the moment.</p>
          ) : (
            <div className="space-y-4">
              {pendingReports.map((report) => (
                <Card key={report.id} className="border rounded-lg shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg font-medium text-gray-800">
                      {report.title}
                    </CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                  </CardHeader>
                  <CardContent>{renderReportDetails(report)}</CardContent>
                  <CardFooter className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2">
                    <Button
                      onClick={() => {
                        goToComparePage(report.project_id);
                      }}
                    >
                      Compare Images
                    </Button>
                    <Button onClick={() => {}}>View Logs</Button>
                    <Button onClick={() => {}}>Grant Log</Button>
                    <Button onClick={() => resolveReport(report.id)}>
                      Mark as Resolved
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => deleteReport(report.id, "pending")}
                    >
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="resolved" className="mt-6">
          {resolvedReports.length === 0 ? (
            <p className="text-gray-500">No resolved reports yet.</p>
          ) : (
            <div className="space-y-4">
              {resolvedReports.map((report) => (
                <Card key={report.id} className="border rounded-lg shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg font-medium text-gray-800">
                      {report.title}
                    </CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                  </CardHeader>
                  <CardContent>{renderReportDetails(report)}</CardContent>
                  <CardFooter className="flex space-x-2">
                    <Button
                      variant="destructive"
                      onClick={() => deleteReport(report.id, "resolved")}
                    >
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
