import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";
import { Trash2, Upload } from "lucide-react";
import { useAuthContext } from "@/hooks/useAuthContext";
import apiClient from "@/utils/appClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import TemplatePreview from "./TemplatePreview";
type Template = {
  template_id: string;
  template_name: string;
  template_data: object;
  created_at?: Date;
  updated_at?: Date;
};

const TemplateSection = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    const get_templates = async () => {
      try {
        const response = await apiClient.get("/all_templates", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
        });
        const templates = response.data.data;
        setTemplates(templates);
      } catch (error) {
        console.error("Failed to fetch templates:", error);
        toast({ description: "Failed to load templates", duration: 3000 });
      }
    };

    get_templates();
  }, []);

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await apiClient.delete(`/delete_template/${templateId}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      setTemplates(
        templates.filter((template) => template.template_id !== templateId)
      );
      toast({ description: "Template deleted successfully", duration: 3000 });
    } catch (error) {
      console.error("Failed to delete template:", error);
      toast({ description: "Failed to delete template", duration: 3000 });
    }
  };

  return (
    <div>
      <div className="flex w-full justify-end mb-3">
        <button
          className=" border border-gray-600 px-6 py-3 rounded-md flex items-center gap-2 shadow-md w-64 justify-center"
          onClick={() => {
            navigate("/admin/templates/upload");
          }}
        >
          <Upload size={20} /> Add New Template
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4  lg:grid-cols-5 gap-6">
        {templates.map((template: Template) => (
          <Card
            key={template.template_id}
            className="overflow-hidden w-full rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:shadow-md transition-shadow duration-200 cursor-pointer"
          >
            <CardContent className="p-4 flex flex-col h-[300px]">
              <div className="flex-1 min-h-0">
                <TemplatePreview objects={template.template_data} />
              </div>
              <div className="mt-2 flex justify-between items-center border-t pt-2 border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-medium truncate max-w-[150px]">
                    {template.template_name}
                  </p>
                  <p className="text-xs">
                    {new Date(template.created_at || "").toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTemplate(template.template_id);
                  }}
                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full transition-colors"
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TemplateSection;
