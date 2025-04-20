// components/dashboard.tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Badge } from "@/components/ui/badge";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { EyeIcon, StarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import apiClient from "@/utils/appClient";
import { useParams } from "react-router-dom";
import { useAuthContext } from "@/hooks/useAuthContext";
import { get } from "node:http";

// TODO: what to do if the image is very big I do not think the display would look very good

type logType = {
  section: string;
  tab: string;
  event: string;
  message: string;
  param?: string | null;
  objType?: string | null;
  value?: string | null;
  timestamp: string;
};

type projectType = {
  project_name: string;
  username: string;
  project_data: string;
  project_logs: logType[];
  original_image_url: string;
  canvas_image_url: string;
  original_image_shape: { width: number; height: number };
  final_image_shape: { width: number; height: number }; // the image after resizing
  download_image_shape: { width: number; height: number }; // this is the actual download canvas size(in case of rotation final image size and download size would not match)
  total_views: number;
  total_rating: number;
  rating_count: number;
  filter_names: string[];
  created_at: Date;
  updated_at: Date;
};

export function ProjectInfo({ project }: { project: projectType }) {
  const rating =
    project.rating_count > 0
      ? (project.total_rating / project.rating_count).toFixed(1)
      : "No ratings";

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="text-blue-800">Project Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-blue-700">
                Project Name:
              </span>
              <span className="text-sm text-blue-900">
                {project.project_name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-blue-700">
                Created By:
              </span>
              <span className="text-sm text-blue-900">{project.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-blue-700">
                Created At:
              </span>
              <span className="text-sm text-blue-900">
                {new Date(project.created_at).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-blue-700">
                Last Updated:
              </span>
              <span className="text-sm text-blue-900">
                {new Date(project.updated_at).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-blue-700">
                Original Dimensions:
              </span>
              <span className="text-sm text-blue-900">
                {project.original_image_shape.width} ×{" "}
                {project.original_image_shape.height}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-blue-700">
                Final Dimensions:
              </span>
              <span className="text-sm text-blue-900">
                {project.final_image_shape.width} ×{" "}
                {project.final_image_shape.height}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-blue-700">
                Download Dimensions:
              </span>
              <span className="text-sm text-blue-900">
                {project.download_image_shape.width} ×{" "}
                {project.download_image_shape.height}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-700 flex items-center">
                <EyeIcon className="h-4 w-4 mr-1" /> Views:
              </span>
              <span className="text-sm text-blue-900">
                {project.total_views}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-700 flex items-center">
                <StarIcon className="h-4 w-4 mr-1" /> Rating:
              </span>
              <span className="text-sm text-blue-900">{rating}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ImageComparison({
  original,
  final,
}: {
  original: string;
  final: string;
}) {
  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="text-blue-800">Image Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="side-by-side" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-blue-100">
            <TabsTrigger
              value="side-by-side"
              className="text-blue-800 data-[state=active]:bg-blue-200"
            >
              Side by Side
            </TabsTrigger>
            <TabsTrigger
              value="original"
              className="text-blue-800 data-[state=active]:bg-blue-200"
            >
              Original
            </TabsTrigger>
            <TabsTrigger
              value="final"
              className="text-blue-800 data-[state=active]:bg-blue-200"
            >
              Final
            </TabsTrigger>
          </TabsList>

          <TabsContent value="side-by-side">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-blue-700">
                  Original Image
                </h3>

                <div className="relative aspect-square border border-blue-200 rounded-lg overflow-hidden">
                  <img
                    src={original}
                    alt="Original image"
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-blue-700">
                  Final Image
                </h3>
                <div className="relative aspect-square border border-blue-200 rounded-lg overflow-hidden">
                  <img
                    src={final}
                    alt="Final image"
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="original">
            <div className="flex justify-center items-center w-full border border-blue-200 rounded-lg overflow-hidden">
              <img
                src={original}
                alt="Original image"
                className="object-contain space-y-2 rounded-lg"
              />
            </div>
          </TabsContent>

          <TabsContent value="final">
            <div className="relative w-full aspect-square border border-blue-200 rounded-lg overflow-hidden">
              <img src={final} alt="Final image" className="object-contain" />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export function FiltersDisplay({ filters }: { filters: string[] }) {
  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="text-blue-800">Applied Filters</CardTitle>
      </CardHeader>
      <CardContent>
        {filters.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {filters.map((filter, index) => (
              <Badge
                key={index}
                variant="outline"
                className="bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200"
              >
                {filter}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-blue-700">
            No filters were applied to this project.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function LogsSection({ logs }: { logs: logType[] }) {
  // Group logs by event type for the chart
  const eventCounts = logs.reduce((acc, log) => {
    acc[log.event] = (acc[log.event] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(eventCounts).map(([event, count]) => ({
    event,
    count,
  }));

  return (
    <Card className="border-blue-200 h-full">
      <CardHeader>
        <CardTitle className="text-blue-800">Activity Logs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="event" stroke="#1e40af" />
              <YAxis stroke="#1e40af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#f8fafc",
                  borderColor: "#bfdbfe",
                  borderRadius: "0.5rem",
                }}
                itemStyle={{ color: "#1e40af" }}
                labelStyle={{ color: "#1e3a8a", fontWeight: "bold" }}
              />
              <Bar dataKey="count" fill="#60a5fa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader className="bg-blue-50">
              <TableRow>
                <TableHead className="text-blue-800">Time</TableHead>
                <TableHead className="text-blue-800">Event</TableHead>
                <TableHead className="text-blue-800">Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log, index) => (
                <TableRow key={index} className="hover:bg-blue-50">
                  <TableCell className="text-sm text-blue-900">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </TableCell>
                  <TableCell className="text-sm text-blue-900">
                    {log.event}
                  </TableCell>
                  <TableCell className="text-sm text-blue-900">
                    {log.message}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export function Histograms({
  original,
  final,
  originalShape,
  finalShape,
}: {
  original: string;
  final: string;
  originalShape: { width: number; height: number };
  finalShape: { width: number; height: number };
}) {
  type HistogramDataType = {
    red: { value: number; count: number }[];
    green: { value: number; count: number }[];
    blue: { value: number; count: number }[];
  };

  const [loading, setLoading] = useState(true);

  const [originalImageData, setOriginalImageData] =
    useState<HistogramDataType | null>(null);
  const [finalImageData, setFinalImageData] =
    useState<HistogramDataType | null>(null);

  useEffect(() => {
    const getImageHistogramData = async (
      imageUrl: string
    ): Promise<{
      red: { value: number; count: number }[];
      green: { value: number; count: number }[];
      blue: { value: number; count: number }[];
    }> => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;

      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Unable to get canvas context");

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      ).data;

      // Using objects to store only existing values
      const red: Record<number, number> = {};
      const green: Record<number, number> = {};
      const blue: Record<number, number> = {};

      for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];

        red[r] = (red[r] || 0) + 1;
        green[g] = (green[g] || 0) + 1;
        blue[b] = (blue[b] || 0) + 1;
      }

      // Convert to array format and fill missing values if needed
      const convertToHistogramArray = (channelData: Record<number, number>) => {
        const result = [];
        for (let value = 0; value <= 255; value++) {
          result.push({
            value,
            count: channelData[value] || 0,
          });
        }
        return result;
      };

      return {
        red: convertToHistogramArray(red),
        green: convertToHistogramArray(green),
        blue: convertToHistogramArray(blue),
      };
    };

    const getData = async () => {
      try {
        const [originalData, finalData] = await Promise.all([
          getImageHistogramData(original),
          getImageHistogramData(final),
        ]);

        setOriginalImageData({
          red: originalData.red,
          blue: originalData.blue,
          green: originalData.green,
        });

        setFinalImageData({
          red: finalData.red,
          blue: finalData.blue,
          green: finalData.green,
        });
      } catch (error) {
        console.error("Error loading image data:", error);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [original, final]); // Add dependencies here

  if (loading) return <h1>Loading</h1>;

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="text-blue-800">Image Histograms</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="original" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-blue-100">
            <TabsTrigger
              value="original"
              className="text-blue-800 data-[state=active]:bg-blue-200"
            >
              Original Image
            </TabsTrigger>
            <TabsTrigger
              value="final"
              className="text-blue-800 data-[state=active]:bg-blue-200"
            >
              Final Image
            </TabsTrigger>
          </TabsList>

          <TabsContent value="original">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <HistogramChart
                  data={originalImageData.red}
                  color="red"
                  title="Red Channel"
                />
                <HistogramChart
                  data={originalImageData.green}
                  color="green"
                  title="Green Channel"
                />
                <HistogramChart
                  data={originalImageData.blue}
                  color="blue"
                  title="Blue Channel"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="final">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <HistogramChart
                  data={finalImageData.red}
                  color="red"
                  title="Red Channel"
                />
                <HistogramChart
                  data={finalImageData.green}
                  color="green"
                  title="Green Channel"
                />
                <HistogramChart
                  data={finalImageData.blue}
                  color="blue"
                  title="Blue Channel"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export function HistogramChart({
  data,
  color,
  title,
}: {
  data: { value: number; count: number }[];
  color: string;
  title: string;
}) {
  // Find the maximum count for normalization
  const maxCount = Math.max(...data.map((d) => d.count));

  // Create normalized data while preserving original counts
  const normalizedData = data.map((d) => ({
    ...d,
    normalizedCount: d.count / maxCount,
  }));

  // Calculate statistics
  const totalPixels = data.reduce((sum, d) => sum + d.count, 0);
  const mean =
    data.reduce((sum, d) => sum + d.value * d.count, 0) / totalPixels;
  const variance =
    data.reduce((sum, d) => sum + Math.pow(d.value - mean, 2) * d.count, 0) /
    totalPixels;
  const std = Math.sqrt(variance);
  const min = data.find((d) => d.count > 0)?.value ?? 0;
  const max = [...data].reverse().find((d) => d.count > 0)?.value ?? 0;

  return (
    <div className="h-80 flex flex-col items">
      <h3 className="text-sm font-medium text-blue-800 text-center">{title}</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={normalizedData}>
          <XAxis
            dataKey="value"
            tick={{ fontSize: 10 }}
            stroke="#1e40af"
            tickCount={5}
          />
          <YAxis stroke="#1e40af" tick={{ fontSize: 10 }} domain={[0, 1]} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#f8fafc",
              borderColor: "#bfdbfe",
              borderRadius: "0.5rem",
              fontSize: "12px",
            }}
            itemStyle={{ color: "#1e40af" }}
            labelStyle={{ color: "#1e3a8a", fontWeight: "bold" }}
            formatter={(value: number, name: string, props: any) => [
              props.payload.count, // Show original count in tooltip
              "Count",
            ]}
          />
          <Bar dataKey="normalizedCount" fill={color} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="text-xs text-blue-700 mt-2 ml-16">
        <div className="grid grid-cols-2 gap-x-2 justify-center">
          <span className="w-20">Min: {min}</span>
          <span className="w-20">Max: {max}</span>
          <span className="w-20">Mean: {mean.toFixed(2)}</span>
          <span className="w-20">Std: {std.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

export default function LogDashboard() {
  const { projectId } = useParams();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<null | projectType>();

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

        console.log(response.data.data);
        setProject(response.data.data);
        setLoading(false);
        // console.log(response.data.data);
      } catch (err) {
        console.log("Log fecthing failed", err);
      }
    };
    if (user) fetchLogs();
  }, [user]);

  if (loading) return <h1>Loading</h1>;

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-800">
            Project Dashboard
          </h1>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200"
            >
              <DownloadIcon className="mr-2 h-4 w-4" />
              Download Project Data
            </Button>
            <Button
              variant="outline"
              className="bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200"
            >
              <DownloadIcon className="mr-2 h-4 w-4" />
              Download Logs
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ImageComparison
              original={project.original_image_url}
              final={project.canvas_image_url}
            />

            <ProjectInfo project={project} />

            <FiltersDisplay filters={project.filter_names} />
          </div>

          <div className="space-y-6">
            <LogsSection logs={project.project_logs} />
          </div>
        </div>

        <Histograms
          original={project.original_image_url}
          final={project.canvas_image_url}
          originalShape={project.original_image_shape}
          finalShape={project.final_image_shape}
        />
      </div>
    </div>
  );
}
