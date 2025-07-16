import { useEffect, useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, ImagePlus, AlertCircle, Users } from "lucide-react";
import UsersSection from "@/components/UsersSection";
import apiClient from "@/utils/appClient";
import { useAuthContext } from "@/hooks/useAuthContext";
import StyleImageSection from "@/components/StyleImageSection";
import AdminReportSection from "@/components/AdminReportSection";
import { Link } from "react-router-dom";
import AdminUsers from "@/components/AdminUsers";
import Navbar from "@/components/Navbar";
import TemplateSection from "@/components/TemplateSection";

type userInfo = {
  username: string;
  email: string;
  image_url: string;
};

export default function AdminPanelAdvanced() {
  const { user } = useAuthContext();

  const [userInfo, setUserInfo] = useState<null | userInfo>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await apiClient.get(`/user_info/${user?.userId}`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        setUserInfo(response.data.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUserInfo();
  }, [user]);

  return (
    <div className=" bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* Header */}
      <Navbar />

      {/* Main Content */}
      <main className="container mx-auto p-4">
        <Tabs defaultValue="users" className="w-full">
          <TabsList
            className={`grid ${
              user.role === "admin" ? "grid-cols-4" : "grid-cols-5"
            } mb-8`}
          >
            {user.role === "super admin" && (
              <TabsTrigger value="admins" className="flex items-center gap-2">
                <User size={18} /> Admins
              </TabsTrigger>
            )}

            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users size={18} /> Users
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <AlertCircle size={18} /> Reports
            </TabsTrigger>
            <TabsTrigger value="assets" className="flex items-center gap-2">
              <ImagePlus size={18} /> Assets
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <ImagePlus size={18} /> Templates
            </TabsTrigger>
          </TabsList>

          {/* Admin Users Tab */}
          {user.role === "super admin" && (
            <TabsContent value="admins">
              <AdminUsers />
            </TabsContent>
          )}

          {/* Users Tab */}
          <TabsContent value="users">
            <UsersSection />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <AdminReportSection />
          </TabsContent>

          {/* Assets Tab */}
          <TabsContent value="assets">
            <StyleImageSection />
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates">
            <TemplateSection />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
