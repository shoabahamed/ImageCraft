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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
export default function NavbarDemo() {
  const { setTheme } = useTheme();
  const { user, dispatch } = useAuthContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Parse the query parameters from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get("email");
    const token = urlParams.get("token");
    const role = urlParams.get("role");
    const username = urlParams.get("username");
    const userId = urlParams.get("userId");
    const imageUrl = urlParams.get("image_url");

    // If email and token are present, store them and clear the query string
    if (email && token && role && username) {
      const userData = { email, token, role, username, userId, imageUrl };
      localStorage.setItem("user", JSON.stringify(userData));
      dispatch({ type: "LOGIN", payload: userData });

      toast({
        description: "Login successful",
        className: "bg-green-500 text-gray-900",
        duration: 5000,
      });

      // Clear the query string from the URL
      window.history.replaceState({}, document.title, "/");
      console.log(user);
    }
  }, []);

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

  async function handleSignUp(values: z.infer<typeof signupformSchema>) {
    try {
      // Call the signup API endpoint
      const response = await apiClient.post("/signup", {
        username: values.username,
        email: values.email,
        password: values.password,
      });

      if (response.data.success) {
        console.log("Signup successful:", response.data.data);
        localStorage.setItem("user", JSON.stringify(response.data.data));
        dispatch({ type: "LOGIN", payload: response.data.data });
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
  }

  async function handleLogIn(values: z.infer<typeof loginformSchema>) {
    try {
      // Call the signup API endpoint
      const response = await apiClient.post("/login", {
        email: values.email,
        password: values.password,
      });

      if (response.data.success) {
        console.log("Login successful:", response.data.data);
        localStorage.setItem("user", JSON.stringify(response.data.data));
        dispatch({ type: "LOGIN", payload: response.data.data });
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
  }

  async function handleGoogleLogIn() {
    try {
      // Call the google_login API endpoint
      const response = await apiClient.get("/google_login");

      if (response.data.authorization_url) {
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
    navigate("/");
  };

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Gallery", href: "/gallery", icon: Image },
    {
      name: "Profile",
      href: `/profile/${user?.userId}`,
      icon: User,
      protected: true,
    },
  ];

  return (
    <nav className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-sm">
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
                          src={user?.imageUrl || user?.avatar}
                          alt={user?.username || "User"}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-blue-500 text-white">
                          {user?.username?.slice(0, 2).toUpperCase() || "U"}
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
                      !item.protected || user ? (
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
                {/* sm:w-[60%] md:w-[30%] */}
                <DialogContent className="">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">Login</DialogTitle>
                    <DialogDescription>
                      Enter your email below to login to your account
                    </DialogDescription>
                  </DialogHeader>

                  <div>
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
                              <FormItem className="grid gap-2">
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="john@gmail.com"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={loginform.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem className="grid gap-2">
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <div className=" relative">
                                    <Input
                                      placeholder="123456"
                                      {...field}
                                      type={showPassword ? "text" : "password"}
                                    />

                                    <button
                                      type="button"
                                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                      onClick={() =>
                                        setShowPassword((prev) => !prev)
                                      }
                                    >
                                      {showPassword ? (
                                        <EyeIcon className="w-5 h-5 text-gray-500" />
                                      ) : (
                                        <EyeOffIcon className="w-5 h-5 text-gray-500" />
                                      )}
                                    </button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button className="w-full custom-button">
                            LogIn
                          </Button>
                        </div>
                      </form>
                    </Form>

                    <div className="mt-4">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleGoogleLogIn}
                      >
                        Login with Google
                      </Button>
                      <div className="mt-4 text-center text-sm">
                        Don&apos;t have an account?{" "}
                        <button
                          type="button"
                          className="underline underline-offset-4"
                          onClick={() => {
                            setIsLoginOpen(false);
                            setIsSignUpOpen(true);
                          }}
                        >
                          Sign Up
                        </button>
                      </div>
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
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-2xl">SignUp</DialogTitle>
                    <DialogDescription>
                      Enter your email below to create a account
                    </DialogDescription>
                  </DialogHeader>
                  <div>
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
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={signupform.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="john@gmail.com"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={signupform.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      placeholder="123456"
                                      {...field}
                                      type={showPassword ? "text" : "password"}
                                    />
                                    <button
                                      type="button"
                                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                      onClick={() =>
                                        setShowPassword((prev) => !prev)
                                      }
                                    >
                                      {showPassword ? (
                                        <EyeIcon className="w-5 h-5 text-gray-500" />
                                      ) : (
                                        <EyeOffIcon className="w-5 h-5 text-gray-500" />
                                      )}
                                    </button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button className="w-full custom-button">
                            SignUp
                          </Button>
                        </div>
                      </form>
                    </Form>

                    <div className="mt-4">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleGoogleLogIn}
                      >
                        Signup with Google
                      </Button>
                      <div className="mt-4 text-center text-sm">
                        Already have an account?{" "}
                        <button
                          type="button"
                          className="underline underline-offset-4"
                          onClick={() => {
                            setIsSignUpOpen(false);
                            setIsLoginOpen(true);
                          }}
                        >
                          Login
                        </button>
                      </div>
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
