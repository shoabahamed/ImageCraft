import React, { useEffect, useState } from "react";
import apiClient from "@/utils/appClient";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/hooks/useAuthContext";
import { Button } from "@/components/ui/button";

interface AdminResponse {
  granted_log: boolean | null;
  title: string | null;
  message: string | null;
  logs: string | null;
  original_image_url: string | null;
  canvas_image_url: string | null;
}

interface Report {
  id: string;
  reporter_user_id: string;
  project_id: string;
  project_user_id: string;
  title: string;
  description: string;
  status: "pending" | "resolved";
  created_at: string | null;
  has_admin_response: string;
  admin_response: AdminResponse | null;
}

const UserDashboard: React.FC = () => {
  const { user } = useAuthContext();
  const [reports, setReports] = useState<Report[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await apiClient.get("/get_user_reports", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
        });
        console.log(response.data.data);
        setReports(response.data.data);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
        toast({ description: "Failed to load reports", duration: 3000 });
      }
    };

    fetchReports();
  }, [toast, user?.token]);

  const downloadAsFile = (content: any, filename: string) => {
    try {
      const fileContent =
        typeof content === "object"
          ? JSON.stringify(content, null, 2)
          : content;
      const file = new Blob([fileContent], { type: "application/json" });
      const element = document.createElement("a");
      element.href = URL.createObjectURL(file);
      element.download = filename;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (error) {
      console.error("Failed to download file:", error);
      alert("Failed to download the file.");
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] p-6">
      {/* User Profile Section */}
      <section className="bg-[hsl(var(--card))] p-8 rounded-lg shadow-lg max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-4">
          {user?.username}'s Dashboard
        </h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          Email: {user?.email || "N/A"}
        </p>
      </section>

      {/* Reports Section */}
      <section className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] mb-6">
          My Reports
        </h2>
        {reports.length === 0 ? (
          <div className="text-center text-[hsl(var(--muted-foreground))]">
            <p>You have not submitted any reports.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-[hsl(var(--card))] p-6 rounded-lg shadow-lg"
              >
                {/* Report Header */}
                <h3 className="text-lg font-bold text-[hsl(var(--card-foreground))]">
                  <strong>Title:</strong> {report.title}
                </h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  <strong>Description:</strong> {report.description}
                </p>

                {/* Report Metadata */}
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
                  Status:{" "}
                  <span
                    className={`font-medium px-2 py-1 rounded ${
                      report.has_admin_response === "false"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {report.has_admin_response === "false"
                      ? "Pending"
                      : "Resolved"}
                  </span>
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Submitted:{" "}
                  {report.created_at
                    ? new Date(report.created_at).toLocaleString()
                    : "N/A"}
                </p>

                {/* Admin Response Section */}
                <div className="mt-4 p-4 bg-[hsl(var(--popover))] border border-[hsl(var(--border))] rounded-md">
                  {report.has_admin_response === "false" ? (
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      <strong>Admin Response:</strong> Admin has not responded
                      yet.
                    </p>
                  ) : (
                    <>
                      <h4 className="text-sm font-semibold text-[hsl(var(--card-foreground))] mb-2">
                        Admin Response
                      </h4>
                      {report.admin_response?.title && (
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">
                          <strong>Title:</strong> {report.admin_response.title}
                        </p>
                      )}
                      <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">
                        <strong>Message:</strong>{" "}
                        {report.admin_response?.message ||
                          "No message provided"}
                      </p>
                      <div className="mt-3 flex flex-col space-y-2">
                        {report.admin_response?.logs && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              downloadAsFile(
                                report.admin_response.logs,
                                `logs-${report.id}.txt`
                              )
                            }
                          >
                            Download Logs
                          </Button>
                        )}
                        {report.admin_response?.original_image_url && (
                          <a
                            href={report.admin_response.original_image_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 underline"
                          >
                            View Original Image
                          </a>
                        )}
                        {report.admin_response?.canvas_image_url && (
                          <a
                            href={report.admin_response.canvas_image_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 underline"
                          >
                            View Canvas Image
                          </a>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default UserDashboard;
