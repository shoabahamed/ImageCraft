import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { X, ArrowDownToLine, Download, Shield } from "lucide-react";

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

  console.log(project);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white dark:bg-gray-900 backdrop-blur-lg rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl ">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-50 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 transition-colors duration-200"
        >
          <X className="h-4 w-4 text-gray-700 dark:text-gray-300" />
        </button>

        {/* Image Preview Section */}
        <div className="relative w-full h-[400px] bg-gray-50 dark:bg-gray-900/50">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/10 to-transparent dark:from-black/20 dark:to-transparent z-10" />
            <img
              src={project?.canvas_image_url}
              alt="Preview"
              className="w-full h-full object-contain transform transition-transform duration-300"
            />
          </div>
        </div>

        {/* Download Options Section */}
        <div className="p-8 bg-gradient-to-b from-white/80 to-white dark:from-gray-900/80 dark:to-gray-900">
          <div className="grid grid-cols-2 gap-6">
            {/* Image Download Option */}
            <button
              onClick={handleDownloadImage}
              className="group relative flex flex-col items-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 hover:from-blue-100 hover:to-blue-200/50 dark:hover:from-blue-800/30 dark:hover:to-blue-700/30 transition-all duration-300 overflow-hidden"
            >
              <div className="relative z-10 flex flex-col items-center space-y-3">
                <div className="p-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 text-white shadow-lg transform group-hover:scale-110 group-hover:shadow-blue-500/25 dark:group-hover:shadow-blue-400/25 transition-all duration-300">
                  <ArrowDownToLine className="h-6 w-6" />
                </div>
                <span className="font-medium text-blue-900/80 dark:text-blue-100/80 group-hover:text-blue-900 dark:group-hover:text-blue-100">
                  PNG Image
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/5 dark:from-blue-400/0 dark:to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>

            {/* Canvas Data Option */}
            <button
              onClick={handleDownloadCanvas}
              className="group relative flex flex-col items-center p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20 hover:from-purple-100 hover:to-purple-200/50 dark:hover:from-purple-800/30 dark:hover:to-purple-700/30 transition-all duration-300 overflow-hidden"
            >
              <div className="relative z-10 flex flex-col items-center space-y-3">
                <div className="p-4 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500 text-white shadow-lg transform group-hover:scale-110 group-hover:shadow-purple-500/25 dark:group-hover:shadow-purple-400/25 transition-all duration-300">
                  <Download className="h-6 w-6" />
                </div>
                <span className="font-medium text-purple-900/80 dark:text-purple-100/80 group-hover:text-purple-900 dark:group-hover:text-purple-100">
                  Project File
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/5 dark:from-purple-400/0 dark:to-purple-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>Protected by our terms of service</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
