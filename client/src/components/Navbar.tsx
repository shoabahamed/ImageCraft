import { useEffect, useState } from "react";
import {
  Moon,
  Sun,
  Menu,
  LogOut,
  User,
  Home,
  Camera,
  Image,
  Gem,
  Crown,
  Shield,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "./ui/theme-provider";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import apiClient from "@/utils/appClient";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import axios from "axios";

import { Canvas } from "fabric";
import { useLogContext } from "@/hooks/useLogContext";
import { useCanvasObjects } from "@/hooks/useCanvasObjectContext";
import { useCommonProps } from "@/hooks/appStore/CommonProps";

const signupformSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address",
  }),

  password: z.string().min(6, {
    message: "Password must be at least 6 characters long",
  }),
});

const loginformSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),

  password: z.string().min(6, {
    message: "Password must be at least 6 characters long",
  }),
});

// Main Navbar Component
export default function Navbar({
  canvasRef,
  canvasId,
  imageUrl,
}: {
  canvasRef?: React.RefObject<Canvas>;
  canvasId?: string;
  imageUrl?: string;
}) {
  const { setTheme } = useTheme();
  const { user, dispatch } = useAuthContext();
  const {
    finalImageDimensions,
    originalImageDimensions,
    downloadImageDimensions,
    allFiltersRef,
    currentFiltersRef,
  } = useCanvasObjects();

  const projectName = useCommonProps((state) => state.projectName);

  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // useEffect(() => {
  //   // Parse the query parameters from the URL
  //   const urlParams = new URLSearchParams(window.location.search);
  //   const email = urlParams.get("email");
  //   const token = urlParams.get("token");
  //   const role = urlParams.get("role");
  //   const username = urlParams.get("username");
  //   const userId = urlParams.get("userId");
  //   const imageUrl = urlParams.get("image_url");
  //   const subscriptionPlan = urlParams.get("subscription_plan");

  //   // If email and token are present, store them and clear the query string
  //   if (email && token && role && username) {
  //     const userData = {
  //       email,
  //       token,
  //       role,
  //       username,
  //       userId,
  //       imageUrl,
  //       subscriptionPlan,
  //     };
  //     localStorage.setItem("user", JSON.stringify(userData));
  //     dispatch({ type: "LOGIN", payload: userData });

  //     toast({
  //       description: "Login successful",
  //       className: "bg-green-500 text-gray-900",
  //       duration: 5000,
  //     });

  //     // Clear the query string from the URL
  //     window.history.replaceState({}, document.title, "/");
  //     console.log(user);
  //   }
  // }, []);

  // 1. Define your form.

  const signupform = useForm<z.infer<typeof signupformSchema>>({
    resolver: zodResolver(signupformSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const loginform = useForm<z.infer<typeof loginformSchema>>({
    resolver: zodResolver(loginformSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSignUp = async (values: z.infer<typeof signupformSchema>) => {
    try {
      // Call the signup API endpoint
      const response = await apiClient.post("/signup", {
        username: values.username,
        email: values.email,
        password: values.password,
      });

      if (response.data.success) {
        console.log("Signup successful:", response.data.data);
        const {
          email,
          token,
          role,
          username,
          userId,
          image_url: imageUrl,
          subscription_plan: subscriptionPlan,
        } = response.data.data;
        const userData = {
          email,
          token,
          role,
          username,
          userId,
          imageUrl,
          subscriptionPlan,
        };
        localStorage.setItem("user", JSON.stringify(userData));
        dispatch({ type: "LOGIN", payload: userData });
        toast({
          description: "Sign up Successfull.",
          className: "bg-green-500 text-gray-900",
          duration: 2000,
        });
      } else {
        console.error("Signup failed:", response.data.message);
        toast({
          description: "OOps Auth Unsuccessfull.",
        });
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast({
          variant: "destructive",
          description: "Sign up Failed." + error.response.data.message,
          className: "text-gray-900",
          duration: 3000,
        });
        console.error("Error during signup:", error.response.data.message);
      } else {
        toast({
          variant: "destructive",
          description: "Unexpected error",
          className: "bg-green-500 text-gray-900",
          duration: 3000,
        });
        console.error("Unexpected error:", error);
      }
    }

    setIsSignUpOpen(false);
  };

  const handleLogIn = async (values: z.infer<typeof loginformSchema>) => {
    try {
      // Call the signup API endpoint
      const response = await apiClient.post("/login", {
        email: values.email,
        password: values.password,
      });

      if (response.data.success) {
        console.log("Login successful:", response.data.data);
        const {
          email,
          token,
          role,
          username,
          userId,
          image_url: imageUrl,
          subscription_plan: subscriptionPlan,
        } = response.data.data;
        const userData = {
          email,
          token,
          role,
          username,
          userId,
          imageUrl,
          subscriptionPlan,
        };
        localStorage.setItem("user", JSON.stringify(userData));

        dispatch({ type: "LOGIN", payload: userData });
        toast({
          description: "Log in Successfull.",
          className: "bg-green-500 text-gray-900",
          duration: 2000,
        });
      } else {
        toast({
          variant: "destructive",
          description: "Log in Failed.",
          className: "bg-green-500 text-gray-900",
          duration: 3000,
        });
        console.error("Login failed:", response.data.message);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast({
          variant: "destructive",
          description: "Log in Failed." + error.response.data.message,
          className: "bg-green-500 text-gray-900",
          duration: 3000,
        });
        console.error("Error during login:", error.response.data.message);
      } else {
        toast({
          variant: "destructive",
          description: "Unexpected error",
          className: "bg-green-500 text-gray-900",
          duration: 3000,
        });
        console.error("Unexpected error:", error);
      }
    }

    setIsLoginOpen(false);
  };

  async function handleGoogleLogIn() {
    try {
      // Call the google_login API endpoint
      const response = await apiClient.get("/google_login");

      if (response.data.authorization_url) {
        // if (canvasRef.current) {
        //   const { imageHeight: finalImageHeight, imageWidth: finalImageWidth } =
        //     finalImageDimensions;
        //   const { imageHeight: originalHeight, imageWidth: originalWidth } =
        //     originalImageDimensions;
        //   const { imageHeight: downloadHeight, imageWidth: downloadWidth } =
        //     downloadImageDimensions;

        //   // we need store the current state of the images
        //   const project_data = canvasRef.current.toObject([
        //     "name",
        //     "isUpper",
        //     "id",
        //   ]);
        //   const project_logs = JSON.stringify(logs);
        //   const project_name = projectName;
        //   const final_image_shape = JSON.stringify({
        //     width: finalImageWidth,
        //     height: finalImageHeight,
        //   });
        //   const original_image_shape = JSON.stringify({
        //     width: originalWidth,
        //     height: originalHeight,
        //   });
        //   const download_image_shape = JSON.stringify({
        //     width: downloadWidth,
        //     height: downloadHeight,
        //   });

        //   const filterNames =
        //     JSON.stringify(
        //       currentFiltersRef.current.map((filter) => filter.filterName)
        //     ) || JSON.stringify([]);

        //   const all_filters_applied = JSON.stringify(allFiltersRef.current);

        //   localStorage.setItem("canvasId", canvasId);

        //   localStorage.setItem("project_data", project_data);
        //   localStorage.setItem("project_logs", project_logs);
        //   localStorage.setItem("project_name", project_name);
        //   localStorage.setItem("final_image_shape", final_image_shape);
        //   localStorage.setItem("original_image_shape", original_image_shape);
        //   localStorage.setItem("download_image_shape", download_image_shape);
        //   localStorage.setItem("filter_names", filterNames);
        //   localStorage.setItem("all_filters_applied", all_filters_applied);
        //   localStorage.setItem("imageUrl", imageUrl)
        // }

        // Redirect the user to Google's OAuth page
        window.location.href = response.data.authorization_url;
      } else {
        console.error("Authorization URL not found in response");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast({
          variant: "destructive",
          description: "Google Log in Failed." + error.response.data.message,
          className: "bg-green-500 text-gray-900",
          duration: 3000,
        });
      } else {
        toast({
          variant: "destructive",
          description: "Unexpected error",
          className: "bg-green-500 text-gray-900",
          duration: 3000,
        });
        console.error("Unexpected error:", error);
      }
    }
  }

  const handleLogOut = () => {
    localStorage.removeItem("user");
    dispatch({ type: "LOGOUT" });
    toast({
      description: "Log Out Successfull.",
      className: "bg-green-500 text-gray-900",
      duration: 2000,
    });
  };

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Gallery", href: "/gallery", icon: Image },
    // { name: "Pricing", href: "/pricing", icon: Crown },
    {
      name: "Profile",
      href: `/profile/${user?.userId}`,
      icon: User,
      protected: true,
    },
    { name: "Admin", href: "/admin", icon: Shield, protected: true },
  ];

  return (
    <nav className="hidden md:block bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and site name */}
          <div className="flex items-center">
            <a href="/" className="flex-shrink-0 flex items-center">
              <div className="flex items-center">
                <Camera className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-300">
                  Image Craft
                </span>
              </div>
            </a>
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-2">
            {/* Theme toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User controls */}
            {user ? (
              <div className="flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="rounded-full p-0 h-9 w-9 overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                      aria-label="User menu"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={user.imageUrl}
                          alt={user.username}
                          className="object-cover"
                        />

                        <AvatarFallback className="bg-blue-500 text-white">
                          {user.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 py-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-lg rounded-lg"
                  >
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.username}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user?.email || "user@example.com"}
                      </p>
                    </div>

                    {navItems.map((item) =>
                      (!item.protected || user) &&
                      (item.name !== "Admin" ||
                        (item.name === "Admin" && user?.role === "admin")) ? (
                        <DropdownMenuItem
                          key={item.name}
                          className="cursor-pointer flex items-center hover:bg-gray-100 dark:hover:bg-gray-900 px-4 py-2"
                          asChild
                        >
                          <a href={item.href}>
                            <item.icon className="mr-2 h-4 w-4" />
                            <span>{item.name}</span>
                          </a>
                        </DropdownMenuItem>
                      ) : null
                    )}

                    <DropdownMenuSeparator className="my-1 border-t border-gray-100 dark:border-gray-800" />
                    <DropdownMenuItem
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer flex items-center px-4 py-2"
                      onClick={handleLogOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <div className="hidden md:flex space-x-3">
                  <Button
                    variant="ghost"
                    className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setIsLoginOpen(true)}
                  >
                    Log in
                  </Button>

                  <Button
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white "
                    onClick={() => setIsSignUpOpen(true)}
                  >
                    Sign up
                  </Button>
                </div>

                {/* Mobile menu button - only shown when not logged in */}
                <div className="md:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                        aria-label="Menu"
                      >
                        <Menu className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-48 mt-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-lg rounded-lg"
                    >
                      <DropdownMenuItem asChild>
                        <a
                          href="/"
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                        >
                          <Home className="mr-2 h-4 w-4" />
                          Home
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-1 border-t border-gray-100 dark:border-gray-800" />
                      <DropdownMenuItem asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-start font-normal text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => setIsLoginOpen(true)}
                        >
                          Log in
                        </Button>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Button
                          className="w-full justify-start bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-normal"
                          onClick={() => setIsSignUpOpen(true)}
                        >
                          Sign up
                        </Button>
                      </DropdownMenuItem>
                      {/* <DropdownMenuSeparator className="my-1 border-t border-gray-100 dark:border-gray-800" />
                      <DropdownMenuItem asChild>
                        <a
                          href="/pricing"
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                        >
                          <Camera className="mr-2 h-4 w-4" />
                          Pricing
                        </a>
                      </DropdownMenuItem> */}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            )}

            <>
              <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                <DialogTrigger asChild>
                  <p className="hidden cursor-pointer text-gray-300 hover:text-white transition-colors duration-200">
                    SignIn
                  </p>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-background">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-foreground">
                      Welcome Back
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Sign in to your account to continue
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    <Form {...loginform}>
                      <form
                        onSubmit={loginform.handleSubmit(handleLogIn)}
                        className="space-y-4"
                      >
                        <div className="flex flex-col gap-6">
                          <FormField
                            control={loginform.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel className="text-foreground">
                                  Email
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter your email"
                                    className="bg-background border-input"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage className="text-destructive" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={loginform.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel className="text-foreground">
                                  Password
                                </FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      placeholder="Enter your password"
                                      className="bg-background border-input"
                                      {...field}
                                      type={showPassword ? "text" : "password"}
                                    />
                                    <button
                                      type="button"
                                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                      onClick={() =>
                                        setShowPassword((prev) => !prev)
                                      }
                                    >
                                      {showPassword ? (
                                        <EyeIcon className="w-5 h-5" />
                                      ) : (
                                        <EyeOffIcon className="w-5 h-5" />
                                      )}
                                    </button>
                                  </div>
                                </FormControl>
                                <FormMessage className="text-destructive" />
                              </FormItem>
                            )}
                          />
                          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                            Sign In
                          </Button>
                        </div>
                      </form>
                    </Form>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full border-input hover:bg-accent hover:text-accent-foreground"
                      onClick={handleGoogleLogIn}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Continue with Google
                    </Button>

                    <div className="text-center text-sm text-muted-foreground">
                      Don't have an account?{" "}
                      <button
                        type="button"
                        className="font-medium text-primary hover:underline"
                        onClick={() => {
                          setIsLoginOpen(false);
                          setIsSignUpOpen(true);
                        }}
                      >
                        Sign up
                      </button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isSignUpOpen} onOpenChange={setIsSignUpOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-sm hidden" variant={"outline"}>
                    Getting Started
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-background">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-foreground">
                      Create an Account
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Join us and start your journey
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    <Form {...signupform}>
                      <form
                        onSubmit={signupform.handleSubmit(handleSignUp)}
                        className="space-y-4"
                      >
                        <div className="flex flex-col gap-6">
                          <FormField
                            control={signupform.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel className="text-foreground">
                                  Username
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Choose a username"
                                    className="bg-background border-input"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage className="text-destructive" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={signupform.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel className="text-foreground">
                                  Email
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter your email"
                                    className="bg-background border-input"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage className="text-destructive" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={signupform.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel className="text-foreground">
                                  Password
                                </FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      placeholder="Create a password"
                                      className="bg-background border-input"
                                      {...field}
                                      type={showPassword ? "text" : "password"}
                                    />
                                    <button
                                      type="button"
                                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                      onClick={() =>
                                        setShowPassword((prev) => !prev)
                                      }
                                    >
                                      {showPassword ? (
                                        <EyeIcon className="w-5 h-5" />
                                      ) : (
                                        <EyeOffIcon className="w-5 h-5" />
                                      )}
                                    </button>
                                  </div>
                                </FormControl>
                                <FormMessage className="text-destructive" />
                              </FormItem>
                            )}
                          />
                          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                            Create Account
                          </Button>
                        </div>
                      </form>
                    </Form>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full border-input hover:bg-accent hover:text-accent-foreground"
                      onClick={handleGoogleLogIn}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Continue with Google
                    </Button>

                    <div className="text-center text-sm text-muted-foreground">
                      Already have an account?{" "}
                      <button
                        type="button"
                        className="font-medium text-primary hover:underline"
                        onClick={() => {
                          setIsSignUpOpen(false);
                          setIsLoginOpen(true);
                        }}
                      >
                        Sign in
                      </button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          </div>
        </div>
      </div>
    </nav>
  );
}
