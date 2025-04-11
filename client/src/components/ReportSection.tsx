import React, { useEffect, useState } from "react";
import apiClient from "@/utils/appClient";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/hooks/useAuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
  created_at: Date;
  has_admin_response: string;
  admin_response: AdminResponse | null;
}

const ReportSection = ({ userId }: { userId: string }) => {
  const { user } = useAuthContext();
  const [reports, setReports] = useState<Report[]>([]);
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const projectPerPage = 6;
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(projectPerPage);
  const [currentPageNo, setCurrentPageNo] = useState(1);
  const [pages, setPages] = useState<number[]>([1]);

  const calculatePages = (totalProjects: number) => {
    const totalPages = Math.ceil(totalProjects / projectPerPage);
    // console.log(totalProjects);
    const temp: number[] = [];
    for (let i = 1; i <= totalPages; i++) {
      temp.push(i);
    }

    return temp;
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await apiClient.get(`/get_user_reports/${userId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
        });
        const fetchedReports = response.data.data.map((report: Report) => ({
          ...report,
          created_at: new Date(report.created_at),
        }));

        const sortedReports = fetchedReports.sort((a, b) => {
          return b.created_at.getTime() - a.created_at.getTime();
        });

        setReports(sortedReports);
        setPages(calculatePages(sortedReports.length));
      } catch (error) {
        setError("Failed to fetch reports" + error);
        toast({ description: "Failed to load reports", duration: 3000 });
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [toast, user?.token]);

  useEffect(() => {
    const eIndex = Math.max(currentPageNo * projectPerPage, 0);
    const sIndex = Math.min(eIndex - projectPerPage, reports.length);

    setStartIndex(sIndex);
    setEndIndex(eIndex);
  }, [currentPageNo]);

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  return (
    <div className="w-full flex flex-col space-y-4">
      {reports.length == 0 && (
        <h1 className="text-3xl text-red-500 flex justify-center items-center">
          No reports found
        </h1>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.slice(startIndex, endIndex).map((report) => (
          <div
            key={report.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            {/* Report Header */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-blue-800">
                  {report.title}
                </h3>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    report.has_admin_response === "false"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {report.has_admin_response === "false"
                    ? "Pending"
                    : "Resolved"}
                </span>
              </div>

              {/* Report Description */}
              <p className="text-sm text-gray-600 mb-3">{report.description}</p>

              {/* Report Metadata */}
              <div className="flex items-center text-sm text-gray-500 mb-3">
                <span>Submitted:</span>
                <span className="ml-1">
                  {report.created_at
                    ? new Date(report.created_at).toLocaleString()
                    : "N/A"}
                </span>
              </div>

              {/* Admin Response Section */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                {report.has_admin_response === "false" ? (
                  <div className="flex items-center text-sm text-gray-500">
                    <svg
                      className="w-4 h-4 mr-1 text-yellow-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Admin has not responded yet</span>
                  </div>
                ) : (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">
                      Admin Response
                    </h4>
                    {report.admin_response?.title && (
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Title:</strong> {report.admin_response.title}
                      </p>
                    )}
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Message:</strong>{" "}
                      {report.admin_response?.message || ""}
                      {report.admin_response?.granted_log && (
                        <span className="ml-1">
                          You can find details of logs
                          <Link
                            to={`http://localhost:5173/log_dashboard/${report.project_id}`}
                            className="px-1 underline text-blue-600 hover:text-blue-800"
                          >
                            here
                          </Link>
                        </span>
                      )}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {report.admin_response?.logs && (
                        <button
                          className="inline-flex items-center px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
                          onClick={() =>
                            downloadAsFile(
                              report.admin_response?.logs,
                              `logs-${report.id}.txt`
                            )
                          }
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                          Download Logs
                        </button>
                      )}
                      {report.admin_response?.original_image_url && (
                        <a
                          href={report.admin_response.original_image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-blue-600 text-sm font-medium"
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          View Original Image
                        </a>
                      )}
                      {report.admin_response?.canvas_image_url && (
                        <a
                          href={report.admin_response.canvas_image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-blue-600 text-sm font-medium"
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          View Canvas Image
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <Pagination className="flex justify-end p-7">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              className="cursor-pointer"
              onClick={() => {
                setCurrentPageNo(Math.max(currentPageNo - 1, 1));
              }}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>

          {pages
            .slice(
              Math.max(currentPageNo - 2, 0),
              Math.min(currentPageNo + 1, pages.length)
            )
            .map((pageNo) => (
              <PaginationItem key={pageNo}>
                <PaginationLink
                  onClick={() => setCurrentPageNo(pageNo)}
                  isActive={pageNo === currentPageNo}
                  className="cursor-pointer"
                >
                  {pageNo}
                </PaginationLink>
              </PaginationItem>
            ))}

          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              className="cursor-pointer"
              onClick={() => {
                setCurrentPageNo(Math.min(currentPageNo + 1, pages.length));
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default ReportSection;
