import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowDownToLine, Download, Shield } from "lucide-react";
import { Link } from "react-router-dom";

interface Project {
  _id: string;
  user_id: string;
  is_public: string;
  project_id: string;
  username: string;
  project_data: object;
  project_logs: object;
  original_image_url: string;
  canvas_image_url: string;
  bookmarked: boolean;
  rating_count: number;
  total_rating: number;
  total_views: number;
  total_bookmark: number;
  original_image_shape: { width: number; height: number };
  final_image_shape: { width: number; height: number };
  download_image_shape: { width: number; height: number };
  project_name: string;
  filter_names: string[] | [];
  all_filters_applied: string[] | [];
  created_at: Date;
  updated_at: Date;
}

interface ProjectDownloadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
}

export function ProjectDownloadDialog({
  open,
  onOpenChange,
  project,
}: ProjectDownloadProps) {
  const { toast } = useToast();

  const handleDownloadImage = async () => {
    if (!project) {
      toast({
        description: "Canvas data not available.",
        className: "bg-red-500 text-white",
        duration: 3000,
      });
      return;
    }

    try {
      const response = await fetch(project?.canvas_image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.project_name || "image"}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        description: "Failed to download image." + error,
        className: "bg-red-500 text-white",
        duration: 3000,
      });
    }
  };

  const handleDownloadCanvas = () => {
    if (!project) {
      toast({
        description: "Canvas data not available.",
        className: "bg-red-500 text-white",
        duration: 3000,
      });
      return;
    }

    const allData = {
      project_data: project.project_data,
      project_logs: project.project_logs,
      project_name: project.project_name,
      final_image_shape: project.final_image_shape,
      original_image_shape: project.original_image_shape,
      download_image_shape: project.download_image_shape,
      filter_names: project.filter_names,
      all_filters_applied: project.all_filters_applied,
      imageUrl: project.original_image_url,
      canvasImageUrl: project.canvas_image_url,
    };

    // Create JSON blob
    const blob = new Blob([JSON.stringify(allData, null, 2)], {
      type: "application/json",
    });

    // Create temporary anchor
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.project_name}_project_data_${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();

    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Calculate average rating
  const calculateRating = (total: number, count: number) => {
    if (!count) return 0;
    return (total / count).toFixed(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[860px] max-h-[92vh] p-0 gap-0 overflow-hidden bg-white dark:bg-gray-900 backdrop-blur-lg rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl [&>button]:z-50 [&>button]:p-2 [&>button]:rounded-full [&>button]:bg-black/50 [&>button]:text-white [&>button]:opacity-100 [&>button]:hover:bg-black/70">
        {/* Image Preview Section */}
        <div className="relative w-full h-[68vh] max-h-[680px] min-h-[280px] bg-gray-100 dark:bg-black/40">
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/10 to-transparent dark:from-black/20 dark:to-transparent pointer-events-none" />
          <img
            src={project?.canvas_image_url}
            alt="Preview"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Project Details Section */}
        <DialogHeader className="px-6 pt-4 space-y-1 text-left">
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-lg font-bold text-gray-800 dark:text-gray-100 truncate">
              {project?.project_name}
            </DialogTitle>
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center bg-yellow-50 dark:bg-yellow-900/30 rounded-md px-1.5 py-0.5">
                <svg
                  className="w-3.5 h-3.5 text-yellow-500 dark:text-yellow-400 mr-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                  {calculateRating(
                    project?.total_rating ?? 0,
                    project?.rating_count ?? 0
                  )}
                </span>
              </div>
              <div className="flex items-center bg-gray-100 dark:bg-gray-800/50 rounded-md px-1.5 py-0.5">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {project?.rating_count ?? 0}{" "}
                  {project?.rating_count === 1 ? "review" : "reviews"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center text-xs text-gray-500 dark:text-gray-400">
            By
            <Link
              to={`/profile/${project?.user_id}`}
              className="pl-1 text-blue-500 dark:text-blue-400 hover:underline italic"
            >
              {project?.username}
            </Link>
            <span className="mx-2">•</span>
            <span>
              {project
                ? new Date(project.created_at).toLocaleDateString()
                : ""}
            </span>
            <span className="mx-2">•</span>
            <span>{project?.total_views ?? 0} views</span>
          </div>
        </DialogHeader>

        {/* Download Options Section */}
        <div className="px-6 pt-4 pb-5 bg-gradient-to-b from-white/80 to-white dark:from-gray-900/80 dark:to-gray-900">
          <div className="grid grid-cols-2 gap-3">
            {/* Image Download Option */}
            <button
              onClick={handleDownloadImage}
              className="group flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors duration-200"
            >
              <div className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 text-white shadow-md transform group-hover:scale-110 transition-transform duration-200">
                <ArrowDownToLine className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-blue-900/80 dark:text-blue-100/80 group-hover:text-blue-900 dark:group-hover:text-blue-100">
                PNG Image
              </span>
            </button>

            {/* Canvas Data Option */}
            <button
              onClick={handleDownloadCanvas}
              className="group flex items-center gap-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-800/30 transition-colors duration-200"
            >
              <div className="p-2 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500 text-white shadow-md transform group-hover:scale-110 transition-transform duration-200">
                <Download className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-purple-900/80 dark:text-purple-100/80 group-hover:text-purple-900 dark:group-hover:text-purple-100">
                Project File
              </span>
            </button>
          </div>

          {/* Footer */}
          <div className="mt-3 flex items-center justify-center text-[11px] text-gray-500 dark:text-gray-400 gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>Protected by our terms of service</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
