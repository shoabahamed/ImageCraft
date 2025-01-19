import React, { useEffect, useState } from "react";
import apiClient from "@/utils/appClient";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/hooks/useAuthContext";

interface ProjectLogs {
  project_data: string; // JSON string
  project_logs: string[]; // Array of log strings
}

const LogsPage: React.FC = () => {
  const { user } = useAuthContext();
  const [logs, setLogs] = useState<ProjectLogs | null>(null);
  const { toast } = useToast();
  const projectId = useLocation().state?.projectId;
  const reportId = useLocation().state?.reportId;

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await apiClient.get(
          `/get_project_by_id/${projectId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user?.token}`,
            },
          }
        );
        setLogs(response.data);
      } catch (error) {
        toast({
          description: "Failed to load project logs.",
          className: "bg-red-500 text-gray-900",
          duration: 3000,
        });
        console.error(error);
      }
    };

    fetchLogs();
  }, [projectId, toast]);

  const handleGrantLogs = async () => {
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

  if (!logs) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
        <p>Loading logs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-[hsl(var(--background))] text-[hsl(var(--foreground))] overflow-hidden">
      {/* Header */}
      <header className="w-full max-w-7xl p-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">Project Logs</h1>
          <p className="text-lg text-[hsl(var(--muted-foreground))]">
            Explore detailed logs and project data below
          </p>
        </div>
        <button onClick={handleGrantLogs} className="custom-button">
          Grant Logs
        </button>
      </header>

      {/* Content */}
      <main className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-7xl p-8 pt-4 overflow-hidden flex-grow">
        {/* Project Data Section */}
        <section className="bg-[hsl(var(--card))] p-6 rounded-lg shadow-lg h-[70vh] overflow-y-auto">
          <h2 className="text-2xl font-semibold mb-4 text-[hsl(var(--card-foreground))]">
            Project Data
          </h2>
          <pre className="bg-[hsl(var(--popover))] p-4 rounded-lg text-sm text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))] whitespace-pre-wrap break-words">
            {JSON.stringify(logs.project_data)}
          </pre>
        </section>

        {/* Project Logs Section */}
        <section className="bg-[hsl(var(--card))] p-6 rounded-lg shadow-lg h-[70vh] overflow-y-auto">
          <h2 className="text-2xl font-semibold mb-4 text-[hsl(var(--card-foreground))]">
            Project Logs
          </h2>
          {logs.project_logs.length > 0 ? (
            <ul className="space-y-4">
              {logs.project_logs.map((log, index) => (
                <li
                  key={index}
                  className="bg-[hsl(var(--popover))] p-4 rounded-md shadow-md border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]"
                >
                  {log}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[hsl(var(--muted-foreground))]">
              No logs available for this project.
            </p>
          )}
        </section>
      </main>
    </div>
  );
};

export default LogsPage;
