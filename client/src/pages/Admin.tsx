import { useEffect, useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, ImagePlus, AlertCircle } from "lucide-react";
import UsersSection from "@/components/UsersSection";
import apiClient from "@/utils/appClient";
import { useAuthContext } from "@/hooks/useAuthContext";
import StyleImageSection from "@/components/StyleImageSection";
import AdminReportSection from "@/components/AdminReportSection";
import { Link } from "react-router-dom";

type userInfo = {
  username: string;
  email: string;
  image_url: string;
};

export default function AdminPanel() {
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
    <div className="bg-blue-50 min-h-screen">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="text-right mr-2">
              <p className="font-medium">{userInfo?.username}</p>
              <p className="text-sm opacity-80">{userInfo?.email}</p>
            </div>
            <Link to={`/profile/${user.userId}`}>
              <Avatar className="h-10 w-10 border-2 border-white">
                <AvatarImage src={userInfo?.image_url} />
                <AvatarFallback className="bg-blue-800">
                  {userInfo?.username
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4">
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <User size={18} /> Users
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <AlertCircle size={18} /> Reports
            </TabsTrigger>
            <TabsTrigger value="assets" className="flex items-center gap-2">
              <ImagePlus size={18} /> Assets
            </TabsTrigger>
          </TabsList>

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
        </Tabs>
      </main>
    </div>
  );
}
