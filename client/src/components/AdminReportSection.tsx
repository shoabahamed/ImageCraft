import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import {
  MessageSquare,
  Trash2,
  MoreVertical,
  Send,
  Clock,
  CheckCircle,
  FileText,
} from "lucide-react";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/utils/appClient";
import { Link, useNavigate } from "react-router-dom";

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
  reporter_name: string;
  reporter_user_id: string;
  project_id: string;
  project_user_name: string;
  project_user_id: string;
  title: string;
  description: string;
  has_admin_response: string;
  admin_response: AdminResponse | null;
  status: "pending" | "resolved";
  created_at: Date;
}

const AdminReportSection = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pendingReports, setPendingReports] = useState<Report[] | []>([]);
  const [resolvedReports, setResolvedReports] = useState<Report[] | []>([]);
  const [messageContent, setMessageContent] = useState("");
  const [messageTitle, setMessageTitle] = useState("");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const projectPerPage = 8;
  const [startPendingIndex, setPendingStartIndex] = useState(0);
  const [endPendingIndex, setEndPendingIndex] = useState(projectPerPage);
  const [currentPendingPageNo, setCurrentPendingPageNo] = useState(1);
  const [PendingPages, setPendingPages] = useState<number[]>([1]);

  const [startResolvedIndex, setResolvedStartIndex] = useState(0);
  const [endResolvedIndex, setEndResolvedIndex] = useState(projectPerPage);
  const [currentResolvedPageNo, setCurrentResolvedPageNo] = useState(1);
  const [ResolvedPages, setResolvedPages] = useState<number[]>([1]);

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
        const response = await apiClient.get("/get_all_reports", {
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

        // Separate reports into pending and resolved based on their status
        setPendingReports(
          sortedReports.filter((report: Report) => report.status === "pending")
        );
        setResolvedReports(
          sortedReports.filter((report: Report) => report.status === "resolved")
        );

        setPendingPages(
          calculatePages(
            sortedReports.filter(
              (report: Report) => report.status === "pending"
            ).length
          )
        );
        setResolvedPages(
          calculatePages(
            sortedReports.filter(
              (report: Report) => report.status === "resolved"
            ).length
          )
        );
      } catch (error) {
        console.error("Failed to fetch reports:", error);
        toast({ description: "Failed to load reports", duration: 3000 });
      }
    };

    fetchReports();
  }, [user?.token]);

  useEffect(() => {
    const eIndex = Math.max(currentPendingPageNo * projectPerPage, 0);
    const sIndex = Math.min(eIndex - projectPerPage, pendingReports.length);

    setPendingStartIndex(sIndex);
    setEndPendingIndex(eIndex);
  }, [currentPendingPageNo]);

  useEffect(() => {
    const eIndex = Math.max(currentResolvedPageNo * projectPerPage, 0);
    const sIndex = Math.min(eIndex - projectPerPage, resolvedReports.length);

    setResolvedStartIndex(sIndex);
    setEndResolvedIndex(eIndex);
  }, [currentResolvedPageNo]);

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

  const deleteProject = async (projectId: string, reportId: string) => {
    try {
      await apiClient.post(
        `/delete_report_project`,
        { projectId, reportId },
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      toast({
        description: "Project deleted successfully.",
        duration: 3000,
        className: "bg-green-500 text-gray-900",
      });

      navigate("/admin");
    } catch {
      toast({
        description: "Failed to delete project.",
        duration: 3000,
        className: "bg-red-500 text-gray-900",
      });
    }
  };

  const grantLogs = async (reportId: string) => {
    try {
      await apiClient.post(
        "/grant_logs",
        { reportId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      toast({
        description: "Logs granted successfully.",
        className: "bg-green-500 text-gray-900",
        duration: 3000,
      });
    } catch (error) {
      toast({
        description: "Failed to grant logs.",
        className: "bg-red-500 text-gray-900",
        duration: 3000,
      });
      console.error(error);
    }
  };

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
          pendingReports.filter((report: Report) => report.id !== reportId)
        );
      } else {
        setResolvedReports(
          resolvedReports.filter((report: Report) => report.id !== reportId)
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

  const handleReportMessage = async () => {
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
          title: messageTitle,
          message: messageContent,
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
      setMessageContent("");
      setMessageTitle("");
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
    <Tabs
      defaultValue="pending"
      className="w-full bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen p-6"
    >
      <TabsList className="mb-6 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-lg">
        <TabsTrigger
          value="pending"
          className="flex items-center gap-2 text-gray-700 dark:text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-blue-700"
        >
          <Clock size={16} /> Pending Reports ({pendingReports.length})
        </TabsTrigger>
        <TabsTrigger
          value="resolved"
          className="flex items-center gap-2 text-gray-700 dark:text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-blue-700"
        >
          <CheckCircle size={16} /> Resolved Reports ({resolvedReports.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pending">
        <div className="grid grid-cols-1 gap-4">
          {pendingReports
            .slice(startPendingIndex, endPendingIndex)
            .map((report) => (
              <Card
                key={report.id}
                className="bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-lg"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                        {report.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <span>
                          Reported on {report.created_at.toLocaleDateString()}
                        </span>
                        <span className="mx-1">•</span>
                        <Badge
                          variant="outline"
                          className="bg-yellow-100/80 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/50"
                        >
                          Pending
                        </Badge>
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      >
                        <DropdownMenuItem
                          onClick={() => deleteReport(report.id, "pending")}
                          className="text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20"
                        >
                          <Trash2 size={14} className="mr-2" /> Delete Report
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50/50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-100/50 dark:border-blue-800/50">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                          Reporter
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {report.reporter_name}{" "}
                          <span className="text-[10px] text-gray-500 dark:text-gray-400">
                            (ID: {report.reporter_user_id})
                          </span>
                        </p>
                      </div>
                      <div className="bg-blue-50/50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-100/50 dark:border-blue-800/50">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                          Project Owner
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {report.project_user_name}{" "}
                          <span className="text-[10px] text-gray-500 dark:text-gray-400">
                            (ID: {report.project_user_id})
                          </span>
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                        Description
                      </h4>
                      <p className="text-sm bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                        {report.description}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                        Admin Response
                      </h4>
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        {report.has_admin_response === "false" ? (
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <svg
                              className="w-4 h-4 mr-1 text-yellow-500 dark:text-yellow-400"
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
                          <div className="bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-100/50 dark:border-blue-800/50">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                              Admin Response
                            </h4>
                            {report.admin_response?.title && (
                              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                <strong>Title:</strong>{" "}
                                {report.admin_response.title}
                              </p>
                            )}
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
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
                                  href={
                                    report.admin_response.original_image_url
                                  }
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
                </CardContent>
                <CardFooter className="flex justify-end gap-2 flex-wrap">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 dark:text-blue-400 border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        onClick={() => setSelectedReportId(report.id)}
                      >
                        <MessageSquare size={16} className="mr-1" /> Reply
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                      <DialogHeader>
                        <DialogTitle className="text-gray-900 dark:text-gray-100">
                          Reply to Report
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-400">
                          Send a message to reporter id{" "}
                          <span className="text-[10px] font-semibold text-gray-900 dark:text-gray-100">
                            {selectedReportId}
                          </span>
                        </DialogDescription>
                      </DialogHeader>
                      <div className="pt-2 pb-0">
                        <Input
                          placeholder="Type your title ..."
                          className=""
                          value={messageTitle}
                          onChange={(e) => setMessageTitle(e.target.value)}
                        />
                      </div>

                      <div className="py-4">
                        <Textarea
                          placeholder="Type your response here..."
                          className="min-h-32"
                          value={messageContent}
                          onChange={(e) => setMessageContent(e.target.value)}
                        />
                      </div>
                      <DialogFooter>
                        <Button
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => {
                            handleReportMessage();
                          }}
                        >
                          <Send size={16} className="mr-2" /> Send Response
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 dark:text-blue-400 border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    onClick={() => {
                      navigate(`/log_dashboard/${report.project_id}`);
                    }}
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
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 dark:text-blue-400 border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    onClick={() => grantLogs(report.id)}
                  >
                    <FileText size={16} className="mr-1" /> Grant Logs
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 dark:text-red-400 border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => deleteProject(report.project_id, report.id)}
                  >
                    <Trash2 size={16} className="mr-1" /> Delete Project
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white"
                    onClick={() => resolveReport(report.id)}
                  >
                    <CheckCircle size={16} className="mr-1" /> Resolve
                  </Button>
                </CardFooter>
              </Card>
            ))}
          {pendingReports.length === 0 && (
            <div className="text-center py-8">
              <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-md p-8 max-w-md mx-auto border border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">
                  No pending reports
                </p>
              </div>
            </div>
          )}
        </div>
        <Pagination className="flex justify-end p-7">
          <PaginationContent className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-1">
            <PaginationItem>
              <PaginationPrevious
                className="cursor-pointer"
                onClick={() => {
                  setCurrentPendingPageNo(
                    Math.max(currentPendingPageNo - 1, 1)
                  );
                }}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>

            {PendingPages.slice(
              Math.max(currentPendingPageNo - 2, 0),
              Math.min(currentPendingPageNo + 1, PendingPages.length)
            ).map((pageNo) => (
              <PaginationItem key={pageNo}>
                <PaginationLink
                  onClick={() => setCurrentPendingPageNo(pageNo)}
                  isActive={pageNo === currentPendingPageNo}
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
                  setCurrentPendingPageNo(
                    Math.min(currentPendingPageNo + 1, PendingPages.length)
                  );
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </TabsContent>

      <TabsContent value="resolved">
        <div className="grid grid-cols-1 gap-4">
          {resolvedReports
            .slice(startResolvedIndex, endResolvedIndex)
            .map((report) => (
              <Card
                key={report.id}
                className="bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 transition-shadow hover:shadow-lg"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                        {report.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <span>
                          Reported on {report.created_at.toLocaleDateString()}
                        </span>
                        <span className="mx-1">•</span>
                        <Badge
                          variant="outline"
                          className="bg-green-100/80 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800/50"
                        >
                          Resolved
                        </Badge>
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      >
                        <DropdownMenuItem
                          onClick={() => deleteReport(report.id, "resolved")}
                          className="text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20"
                        >
                          <Trash2 size={14} className="mr-2" /> Delete Report
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50/50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-100/50 dark:border-blue-800/50">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                          Reporter
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {report.reporter_name}{" "}
                          <span className="text-[10px] text-gray-500 dark:text-gray-400">
                            (ID: {report.reporter_user_id})
                          </span>
                        </p>
                      </div>
                      <div className="bg-blue-50/50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-100/50 dark:border-blue-800/50">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                          Project Owner
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {report.project_user_name}{" "}
                          <span className="text-[10px] text-gray-500 dark:text-gray-400">
                            (ID: {report.project_user_id})
                          </span>
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                        Description
                      </h4>
                      <p className="text-sm bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                        {report.description}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                        Admin Response
                      </h4>
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        {report.has_admin_response === "false" ? (
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <svg
                              className="w-4 h-4 mr-1 text-yellow-500 dark:text-yellow-400"
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
                          <div className="bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-100/50 dark:border-blue-800/50">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                              Admin Response
                            </h4>
                            {report.admin_response?.title && (
                              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                <strong>Title:</strong>{" "}
                                {report.admin_response.title}
                              </p>
                            )}
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                              <strong>Message:</strong>{" "}
                              {report.admin_response?.message || ""}
                              {report.admin_response?.granted_log && (
                                <span className="ml-1">
                                  You can find details of logs
                                  <Link
                                    to={`http://localhost:5173/log_dashboard/${report.project_id}`}
                                    className="px-1 underline text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                                  >
                                    here
                                  </Link>
                                </span>
                              )}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {/* Action buttons with consistent dark mode styling */}
                              {report.admin_response?.logs && (
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white"
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
                                </Button>
                              )}
                              {report.admin_response?.original_image_url && (
                                <a
                                  href={
                                    report.admin_response.original_image_url
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700/50 dark:hover:bg-gray-600/50 text-blue-600 dark:text-blue-400 text-xs font-medium"
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
                                  className="inline-flex items-center px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700/50 dark:hover:bg-gray-600/50 text-blue-600 dark:text-blue-400 text-xs font-medium"
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
                </CardContent>
              </Card>
            ))}

          {resolvedReports.length === 0 && (
            <div className="text-center py-8">
              <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-md p-8 max-w-md mx-auto border border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">
                  No resolved reports
                </p>
              </div>
            </div>
          )}
        </div>

        <Pagination className="flex justify-end p-7">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                className="cursor-pointer"
                onClick={() => {
                  setCurrentPendingPageNo(
                    Math.max(currentResolvedPageNo - 1, 1)
                  );
                }}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>

            {ResolvedPages.slice(
              Math.max(currentResolvedPageNo - 2, 0),
              Math.min(currentResolvedPageNo + 1, ResolvedPages.length)
            ).map((pageNo) => (
              <PaginationItem key={pageNo}>
                <PaginationLink
                  onClick={() => setCurrentResolvedPageNo(pageNo)}
                  isActive={pageNo === currentResolvedPageNo}
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
                  setCurrentResolvedPageNo(
                    Math.min(currentResolvedPageNo + 1, ResolvedPages.length)
                  );
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </TabsContent>
    </Tabs>
  );
};

export default AdminReportSection;
