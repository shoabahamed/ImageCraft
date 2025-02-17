import React, { useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Image, Edit, Brush, Filter, Info, Eye, Star } from "lucide-react";
import { useParams } from "react-router-dom";
import apiClient from "@/utils/appClient";
import { useAuthContext } from "@/hooks/useAuthContext";

const initialEditData = [
  { editType: "Image Size Edit", count: 120 },
  { editType: "Background Edit", count: 90 },
  { editType: "Orientation Edit", count: 70 },
  { editType: "Cut Edit", count: 50 },
  { editType: "Filters Edit", count: 40 },
  { editType: "Image Colors Edit", count: 60 },
  { editType: "Draw Edit", count: 30 },
  { editType: "Text Edit", count: 80 },
  { editType: "AI Edit", count: 100 },
];

const defaultLogs = {
  "Image Size Edit": ["Resized image to 800x600.", "Optimized for web."],
  "Background Edit": ["Removed background.", "Added a blur."],
  "Orientation Edit": ["Rotated image 90 degrees."],
  "Cut Edit": ["Cropped sections of the image."],
  "Filters Edit": ["Applied Sepia filter.", "Enhanced brightness."],
  "Image Colors Edit": ["Increased saturation.", "Adjusted contrast."],
  "Draw Edit": ["Highlighted areas.", "Added annotations."],
  "Text Edit": ["Added custom text.", "Changed font to bold."],
  "AI Edit": ["Enhanced resolution.", "Auto-filled missing parts."],
};

const chartConfig = {
  default: {
    label: "Edits",
    color: "#0070f3", // Lucide-blue
  },
} satisfies ChartConfig;

type logType = {
  section: string;
  tab: string;
  event: string;
  message: string;
  param?: string | null;
  objType?: string | null;
  value?: string | null;
};

type projectType = {
  project_data: string;
  project_logs: logType[];
  original_image_url: string;
  canvas_image_url: string;

  original_image_shape: { width: number; height: number };
  final_image_shape: { width: number; height: number };
  total_views: number;
  total_edits: number;
  rating: number;
  filter: string;
};

const LogDashboard = () => {
  const [project, setProject] = useState<null | projectType>();
  const [editData, setEditData] = useState(initialEditData);
  const [logs, setLogs] = useState<{ [key: string]: string[] }>(defaultLogs);
  const [selectedLog, setSelectedLog] = useState<string[] | null>(null);
  const { projectId } = useParams();
  const { user } = useAuthContext();

  // Sort the bar chart data from highest to lowest
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await apiClient.get(`/project_log/${projectId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
            Role: `${user?.role}`,
          },
        });

        setProject(response.data.data);
        console.log(response.data.data);
      } catch (err) {
        console.log("ksdjfd");
      }
    };
    if (user) fetchLogs();
    const sortedData = [...initialEditData].sort((a, b) => b.count - a.count);
    setEditData(sortedData);
  }, [user]);

  useEffect(() => {
    if (project) {
      const messages: string[] = [];
      const tabs: string[] = [];

      project.project_logs.map((item) => {
        tabs.push(item.tab);
        messages.push(item.message);
      });

      const editCounts = getEditCounts(tabs);
      const logData = getLogs(tabs, messages);

      setEditData(editCounts);
      setLogs(logData);
    }
  }, [project]);

  const getEditCounts = (tabs: string[]) => {
    const editCounts: { [key: string]: number } = {};
    const editCountsArray: { editType: string; count: number }[] = []; // Array for the final result

    tabs.forEach((item: string) => {
      editCounts[item] = editCounts[item] ? editCounts[item] + 1 : 1;
    });

    for (const key in editCounts) {
      editCountsArray.push({ editType: key, count: editCounts[key] });
    }

    return editCountsArray;
  };

  const getLogs = (tabs: string[], messages: string[]) => {
    const logData: { [key: string]: string[] } = {};
    tabs.forEach((tab, index) => {
      if (!logData[tab]) {
        logData[tab] = [];
      }
      logData[tab].push(messages[index]);
    });

    return logData;
  };

  const handleBarClick = (data: any) => {
    setSelectedLog(logs[data.editType] || ["No logs available."]);
  };

  // Download logs as JSON
  const downloadLogs = (logs: logType[]) => {
    const dataStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `project-logs-${projectId}.json`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      {/* <header className="text-center py-4 bg-white shadow-md rounded-lg">
        <h1 className="text-3xl font-bold text-gray-800">
          Image Edit Dashboard
        </h1>
        <p className="text-gray-600">A comprehensive view of your edits</p>
      </header> */}

      {/* General Stats */}
      {project && (
        <div className="bg-white p-8 rounded-lg shadow-lg grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Image Section */}
          <div className="flex flex-col items-center gap-4 border-r pr-4">
            <Image className="text-blue-500 w-10 h-10" />
            <p className="text-gray-500">Original Image</p>
            <img
              src={project.original_image_url}
              alt="Original Image"
              className="w-40 h-40 object-cover rounded-lg shadow-md"
            />
            <p className="text-sm text-gray-600">
              {project.original_image_shape.width}x
              {project.original_image_shape.height}
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 border-r pr-4">
            <Image className="text-green-500 w-10 h-10" />
            <p className="text-gray-500">Final Image</p>
            <img
              src={project.canvas_image_url}
              alt="Final Image"
              className="w-40 h-40 object-cover rounded-lg shadow-md"
            />
            <p className="text-sm text-gray-600">
              {project.final_image_shape.width}x
              {project.final_image_shape.height}
            </p>
          </div>

          <div className="flex flex-col justify-between">
            <div className="grid grid-cols-2 gap-6 justify-center">
              <div className="flex items-center gap-4">
                <Eye className="text-green-500 w-8 h-8" />
                <div>
                  <p className="text-gray-500">Total Views</p>
                  <p className="text-xl font-semibold">{project.total_views}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Star className="text-yellow-500 w-8 h-8" />
                <div>
                  <p className="text-gray-500">Rating</p>
                  <p className="text-xl font-semibold">{project.rating}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Edit className="text-purple-500 w-8 h-8" />
                <div>
                  <p className="text-gray-500">Total Edits</p>
                  <p className="text-xl font-semibold">{project.total_edits}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Filter className="text-yellow-500 w-8 h-8" />
                <div>
                  <p className="text-gray-500">Filter</p>
                  <p className="text-xl font-semibold">{project.filter}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <button
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                onClick={() => downloadLogs(project.project_logs)}
              >
                Download Logs
              </button>
            </div>
          </div>

          {/* Stats Section */}
        </div>
      )}

      {/* Chart and Logs with Adjusted Space */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg col-span-2">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Edit Frequency
          </h2>
          <ChartContainer
            config={chartConfig}
            className="bg-white p-4 rounded-lg shadow-lg"
          >
            <BarChart
              data={editData}
              width={600}
              height={400}
              layout="vertical"
              margin={{ top: 20, right: 20, left: 50, bottom: 20 }}
              onClick={(event) =>
                handleBarClick(event.activePayload?.[0]?.payload)
              }
            >
              <CartesianGrid vertical={false} stroke="#e0e0e0" />
              <XAxis type="number" tickLine={false} axisLine={false} />
              <YAxis
                dataKey="editType"
                type="category"
                tickLine={false}
                axisLine={false}
                style={{ fontSize: "14px" }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="#0070f3" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Edit Logs</h2>
          <div className="overflow-y-auto max-h-[400px] border-t pt-4">
            {selectedLog ? (
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {selectedLog.map((log, index) => (
                  <li key={index}>{log}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">
                Click on a bar in the chart to view logs.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogDashboard;
