import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/hooks/useAuthContext";
import apiClient from "@/utils/appClient";
import React, { useEffect, useState } from "react";

interface AdminResponse {
  granted_log: boolean | null;
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
  admin_response: AdminResponse | null;
}

const UserDashboard: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const { user } = useAuthContext();
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
      // Convert content to a JSON string if it's an object
      const fileContent =
        typeof content === "object"
          ? JSON.stringify(content, null, 2)
          : content;

      // Create a Blob from the string content
      const file = new Blob([fileContent], { type: "application/json" });

      // Create a temporary link element for downloading the file
      const element = document.createElement("a");
      element.href = URL.createObjectURL(file);
      element.download = filename; // Filename for the download
      document.body.appendChild(element);

      // Trigger the download
      element.click();

      // Clean up by removing the element
      document.body.removeChild(element);
    } catch (error) {
      console.error("Failed to download file:", error);
      alert("Failed to download the file.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">User Dashboard</h1>
        <p className="text-gray-500">Welcome back, {user?.username}</p>
      </div>

      {/* Reports Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">My Reports</h2>
        {reports.length === 0 ? (
          <p className="text-gray-500">You have not submitted any reports.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white shadow-md rounded-lg p-6 border border-gray-200"
              >
                {/* Report Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-md font-semibold text-gray-800">
                      {report.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {report.description}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      report.status === "resolved"
                        ? "bg-green-100 text-green-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {report.status.charAt(0).toUpperCase() +
                      report.status.slice(1)}
                  </span>
                </div>

                {/* Report Details */}
                <p className="text-xs text-gray-400 mt-2">
                  Submitted:{" "}
                  {report.created_at
                    ? new Date(report.created_at).toLocaleString()
                    : "N/A"}
                </p>

                {/* Admin Response */}
                {report.admin_response && (
                  <div className="mt-4 p-4 bg-gray-50 border rounded-md">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Admin Response
                    </h4>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Message:</strong>{" "}
                      {report.admin_response.message || "No message provided"}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      <strong>Logs:</strong>
                      {report.admin_response.logs ? (
                        <button
                          onClick={() =>
                            downloadAsFile(
                              report.admin_response.logs,
                              `logs-${report.id}.txt`
                            )
                          }
                          className="text-blue-600 underline"
                        >
                          Download Logs
                        </button>
                      ) : (
                        "No logs available"
                      )}
                    </p>
                    <div className="flex space-x-4">
                      {report.admin_response.original_image_url && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Original Image:
                          </p>
                          <a
                            href={report.admin_response.original_image_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 underline"
                          >
                            View Original
                          </a>
                        </div>
                      )}
                      {report.admin_response.canvas_image_url && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Canvas Image:
                          </p>
                          <a
                            href={report.admin_response.canvas_image_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 underline"
                          >
                            View Canvas
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
