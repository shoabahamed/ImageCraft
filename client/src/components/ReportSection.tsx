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
        // setError("Failed to fetch reports" + error);
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

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 dark:border-blue-400"></div>
      </div>
    );

  if (error)
    return (
      <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
        <p>{error}</p>
      </div>
    );

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Empty State */}
      {reports.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-md mx-auto">
            <svg
              className="mx-auto h-12 w-12 text-blue-400 dark:text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              No Reports Found
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your filters or check back later.
            </p>
          </div>
        </div>
      )}

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.slice(startIndex, endIndex).map((report) => (
          <div
            key={report.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            {/* Report Header */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg text-blue-800 dark:text-blue-400">
                  {report.title}
                </h3>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    report.has_admin_response === "false"
                      ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400"
                      : "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                  }`}
                >
                  {report.has_admin_response === "false"
                    ? "Pending"
                    : "Resolved"}
                </span>
              </div>

              {/* Report Description */}
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {report.description}
              </p>

              {/* Report Metadata */}
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span>Submitted:</span>{" "}
                <span className="ml-1">
                  {new Date(report.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Admin Response Section */}
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 p-4">
              {report.has_admin_response === "false" ? (
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <svg
                    className="w-5 h-5 mr-2 text-yellow-500 dark:text-yellow-400"
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
                  <span>Awaiting admin response</span>
                </div>
              ) : (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                  <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                    Admin Response
                  </h4>
                  {report.admin_response?.title && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      <strong>Title:</strong> {report.admin_response.title}
                    </p>
                  )}
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    <strong>Message:</strong> {report.admin_response?.message}
                    {report.admin_response?.granted_log && (
                      <span className="ml-1">
                        You can view logs{" "}
                        <Link
                          to={`http://localhost:5173/log_dashboard/${report.project_id}`}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                        >
                          here
                        </Link>
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {report.admin_response?.logs && (
                      <Button
                        onClick={() =>
                          downloadAsFile(
                            report.admin_response.logs,
                            `logs-${report.id}.txt`
                          )
                        }
                        className="px-3 py-1.5 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium shadow-sm transition-all duration-150"
                      >
                        Download Logs
                      </Button>
                    )}
                    {report.admin_response?.original_image_url && (
                      <a
                        href={report.admin_response.original_image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-blue-600 dark:text-blue-400 text-xs font-medium shadow-sm transition-all duration-150"
                      >
                        View Original Image
                      </a>
                    )}
                    {report.admin_response?.canvas_image_url && (
                      <a
                        href={report.admin_response.canvas_image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-3 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-blue-600 dark:text-blue-400 text-xs font-medium shadow-sm transition-all duration-150"
                      >
                        View Canvas Image
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <Pagination className="flex justify-end p-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              className="cursor-pointer"
              onClick={() => setCurrentPageNo(Math.max(currentPageNo - 1, 1))}
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
              onClick={() =>
                setCurrentPageNo(Math.min(currentPageNo + 1, pages.length))
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default ReportSection;
