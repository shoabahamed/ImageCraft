import React, { useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Image, Edit, Brush, Filter, Info } from "lucide-react";
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

  return (
    <div className="flex flex-col gap-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="text-center py-4 bg-white shadow-md rounded-lg">
        <h1 className="text-3xl font-bold text-gray-800">
          Image Edit Dashboard
        </h1>
        <p className="text-gray-600">A comprehensive view of your edits</p>
      </header>

      {/* General Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center gap-4">
          <Image className="text-blue-500 w-8 h-8" />
          <div>
            <p className="text-gray-500">Original Image Shape</p>
            <p className="text-xl font-semibold">1920x1080</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Image className="text-green-500 w-8 h-8" />
          <div>
            <p className="text-gray-500">Final Image Shape</p>
            <p className="text-xl font-semibold">800x600</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Info className="text-cyan-500 w-8 h-8" />
          <div>
            <p className="text-gray-500">Image Size</p>
            <p className="text-xl font-semibold">5 MB</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Edit className="text-purple-500 w-8 h-8" />
          <div>
            <p className="text-gray-500">Total Edits</p>
            <p className="text-xl font-semibold">500</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Brush className="text-pink-500 w-8 h-8" />
          <div>
            <p className="text-gray-500">Total Objects</p>
            <p className="text-xl font-semibold">120</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Filter className="text-yellow-500 w-8 h-8" />
          <div>
            <p className="text-gray-500">Filter</p>
            <p className="text-xl font-semibold">Sepia</p>
          </div>
        </div>
      </div>
      {/* Chart and Logs with Adjusted Space */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Chart Section - 2/3 of the Grid */}
        <div className="bg-white p-6 rounded-lg shadow-lg col-span-2 flex flex-col">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Edit Frequency
          </h2>
          <ChartContainer
            config={chartConfig}
            className="bg-white p-4 rounded-lg shadow-lg max-h-[500px] flex-grow"
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

        {/* Log Information - 1/3 of the Grid */}
        <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Edit Logs</h2>
          <div className="flex-grow overflow-y-scroll max-h-[500px] scroll-hiden">
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
