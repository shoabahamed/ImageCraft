import React, { useEffect, useState } from "react";
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  MessageSquare,
  Trash2,
  Send,
  Search,
  UserPlus,
} from "lucide-react";
import apiClient from "@/utils/appClient";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdminInfo {
  user_id: string;
  username: string;
  email: string;
  image_url: string;
  role: string;
}

const adminFormSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters long",
  }),
  role: z.enum(["admin", "super admin"], {
    required_error: "Please select an admin role.",
  }),
});

const AdminUsers = () => {
  const { user: adminUser } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<AdminInfo | null>(null);
  const [filteredAdmins, setFilteredAdmins] = useState<AdminInfo[]>([]);
  const [messageContent, setMessageContent] = useState("");
  const [messageTitle, setMessageTitle] = useState("");
  const [admins, setAdmins] = useState<AdminInfo[]>([]);
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);

  const adminForm = useForm<z.infer<typeof adminFormSchema>>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: "admin",
    },
  });

  const projectPerPage = 6;
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(projectPerPage);
  const [currentPageNo, setCurrentPageNo] = useState(1);
  const [pages, setPages] = useState<number[]>([1]);

  const calculatePages = (totalProjects: number) => {
    const totalPages = Math.ceil(totalProjects / projectPerPage);
    const temp: number[] = [];
    for (let i = 1; i <= totalPages; i++) {
      temp.push(i);
    }
    return temp;
  };

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await apiClient.get("/all_admins", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminUser?.token}`,
          },
        });
        setAdmins(response.data.data);
        setFilteredAdmins(response.data.data);
        setPages(calculatePages(response.data.data.length));
      } catch (err) {
        console.error(err);
        toast({
          variant: "destructive",
          description: "Failed to fetch admin users",
          duration: 3000,
        });
      }
    };

    fetchAdmins();
  }, [adminUser?.token]);

  useEffect(() => {
    const eIndex = Math.max(currentPageNo * projectPerPage, 0);
    const sIndex = Math.min(eIndex - projectPerPage, admins.length);

    setStartIndex(sIndex);
    setEndIndex(eIndex);
  }, [currentPageNo, admins.length]);

  useEffect(() => {
    const tempAdmins = admins.filter(
      (admin) =>
        admin.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredAdmins(tempAdmins);
    setPages(calculatePages(tempAdmins.length));
    setCurrentPageNo(1);
  }, [searchQuery, admins]);

  const deleteAdmin = async (user_id: string) => {
    try {
      await apiClient.delete(`/delete_admin_user/${user_id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminUser?.token}`,
        },
      });
      setAdmins(admins.filter((admin) => admin.user_id !== user_id));
      setFilteredAdmins(
        filteredAdmins.filter((admin) => admin.user_id !== user_id)
      );

      toast({
        description: "Admin deleted successfully!",
        className: "bg-green-500 text-gray-900",
        duration: 3000,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to delete admin.",
        duration: 3000,
      });
      console.error(error);
    }
  };

  const sendMessage = async () => {
    if (messageContent.trim() && currentUser) {
      try {
        await apiClient.post(
          "/send_notice",
          {
            adminId: adminUser?.userId,
            userId: currentUser.user_id,
            title: messageTitle,
            message: messageContent.trim(),
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${adminUser?.token}`,
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
      } catch (error) {
        toast({
          variant: "destructive",
          description: "Failed to send message.",
          duration: 3000,
        });
        console.error(error);
      }
    }
  };

  const createAdmin = async (values: z.infer<typeof adminFormSchema>) => {
    try {
      const response = await apiClient.post(
        "/admin_signup",
        {
          username: values.username,
          email: values.email,
          password: values.password,
          role: values.role,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminUser?.token}`,
          },
        }
      );

      if (response.data.success) {
        toast({
          description: "Admin created successfully!",
          className: "bg-green-500 text-gray-900",
          duration: 3000,
        });

        // Add the new admin to the list
        const newAdmin = {
          user_id: response.data.data.userId,
          username: response.data.data.username,
          email: response.data.data.email,
          image_url: response.data.data.image_url,
          role: response.data.data.role,
        };

        setAdmins([...admins, newAdmin]);
        setIsAddAdminOpen(false);
        adminForm.reset();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to create admin.",
        duration: 3000,
      });
      console.error(error);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search admins by name, email or ID..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Dialog open={isAddAdminOpen} onOpenChange={setIsAddAdminOpen}>
          <DialogTrigger asChild>
            <Button className="ml-4 bg-blue-600 hover:bg-blue-700">
              <UserPlus size={16} className="mr-2" /> Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Create New Admin
              </DialogTitle>
            </DialogHeader>
            <Form {...adminForm}>
              <form
                onSubmit={adminForm.handleSubmit(createAdmin)}
                className="space-y-5 mt-4"
              >
                <FormField
                  control={adminForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Username
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter username"
                          className="border-gray-300 focus:border-blue-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={adminForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter email"
                          className="border-gray-300 focus:border-blue-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={adminForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter password"
                          className="border-gray-300 focus:border-blue-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={adminForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Admin Role
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full border-gray-300 focus:border-blue-500">
                            <SelectValue placeholder="Select admin role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="super admin">
                            Super Admin
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />
                <DialogFooter className="mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddAdminOpen(false)}
                    className="mr-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Create Admin
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col">
        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAdmins.slice(startIndex, endIndex).map((admin) => (
            <Card
              key={admin.user_id}
              className="transition-shadow hover:shadow-md"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={admin.image_url} />
                      <AvatarFallback className="bg-blue-200 text-blue-700">
                        {admin.username
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {admin.username}
                        <Badge className="ml-1 bg-purple-100 text-purple-800 border-purple-200">
                          {admin.role}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{admin.email}</CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-[10px] lg-text-[14px]"
                  >
                    ID: {admin.user_id}
                  </Badge>
                </div>
              </CardHeader>
              <CardFooter className="pt-2 flex justify-end gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600"
                      onClick={() => setCurrentUser(admin)}
                    >
                      <MessageSquare size={16} className="mr-1" /> Message
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        Send Message to {currentUser?.username}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="pt-2 pb-0">
                      <Input
                        placeholder="Type your title ..."
                        className=""
                        value={messageTitle}
                        onChange={(e) => setMessageTitle(e.target.value)}
                      />
                    </div>

                    <div className="pb-4 pt-2">
                      <Textarea
                        placeholder="Type your message here..."
                        className="min-h-32"
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={sendMessage}
                      >
                        <Send size={16} className="mr-2" /> Send Message
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-600"
                  onClick={() => navigate(`/profile/${admin.user_id}`)}
                >
                  <Eye size={16} className="mr-1" /> Profile
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600"
                  onClick={() => deleteAdmin(admin.user_id)}
                >
                  <Trash2 size={16} className="mr-1" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <Pagination className="flex justify-end p-7">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                className="cursor-pointer"
                onClick={() => {
                  setCurrentPageNo(Math.max(currentPageNo - 1, 1));
                }}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>

            {pages
              .slice(
                Math.max(currentPageNo - 2, 0),
                Math.min(currentPageNo + 1, pages.length)
              )
              .map((pageNo) => (
                <PaginationItem key={pageNo}>
                  <PaginationLink
                    onClick={() => setCurrentPageNo(pageNo)}
                    isActive={pageNo === currentPageNo}
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
                  setCurrentPageNo(Math.min(currentPageNo + 1, pages.length));
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default AdminUsers;
