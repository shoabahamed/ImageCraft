// import { ModeToggle } from "./ui/mode-toggle";
import { DialogTrigger } from "@radix-ui/react-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

import { Button } from "@/components/ui/button";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { z } from "zod";

import axios from "axios";
import apiClient from "@/utils/appClient";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/hooks/useAuthContext";
import { Link, useNavigate } from "react-router-dom";

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

const Navbar = () => {
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { user, dispatch } = useAuthContext();
  const navigate = useNavigate();

  const { toast } = useToast();

  useEffect(() => {
    // Parse the query parameters from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get("email");
    const token = urlParams.get("token");
    const role = urlParams.get("role");
    const username = urlParams.get("username");

    // If email and token are present, store them and clear the query string
    if (email && token && role && username) {
      const userData = { email, token, role, username };
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

  return (
    <nav className="w-full pt-3">
      <div className="flex items-center justify-between mx-3 border-b-2 border-slate-300 pb-3">
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <p className="text-3xl font-bold italic">PixelTune</p>
        </div>
        <div className="flex gap-9 items-center">
          {user ? (
            <>
              <Link
                to="/"
                className="relative text-gray-400 font-medium transition-all duration-200 hover:text-white 
      before:content-[''] before:absolute before:left-0 before:bottom-0 before:h-[2px] before:w-0 before:bg-gradient-to-r before:from-blue-300 before:to-cyan-300 before:rounded-full before:transition-all before:duration-300 hover:before:w-full"
              >
                Home
              </Link>
              <Link
                to="/gallery"
                className="relative text-gray-400 font-medium transition-all duration-200 hover:text-white 
      before:content-[''] before:absolute before:left-0 before:bottom-0 before:h-[2px] before:w-0 before:bg-gradient-to-r before:from-blue-300 before:to-cyan-300 before:rounded-full before:transition-all before:duration-300 hover:before:w-full"
              >
                Gallery
              </Link>
              <Link
                to="/projects"
                className="relative text-gray-400 font-medium transition-all duration-200 hover:text-white 
      before:content-[''] before:absolute before:left-0 before:bottom-0 before:h-[2px] before:w-0 before:bg-gradient-to-r before:from-blue-300 before:to-cyan-300 before:rounded-full before:transition-all before:duration-300 hover:before:w-full"
              >
                Projects
              </Link>
              <Link
                to="/profile"
                className="relative text-gray-400 font-medium transition-all duration-200 hover:text-white 
      before:content-[''] before:absolute before:left-0 before:bottom-0 before:h-[2px] before:w-0 before:bg-gradient-to-r before:from-blue-300 before:to-cyan-300 before:rounded-full before:transition-all before:duration-300 hover:before:w-full"
              >
                Profile
              </Link>

              <Button
                size={"sm"}
                onClick={handleLogOut}
                className="custom-delete-button"
              >
                Log Out
              </Button>
            </>
          ) : (
            <>
              <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                <DialogTrigger asChild>
                  <p className="cursor-pointer text-gray-300 hover:text-white transition-colors duration-200">
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
                                  <Input placeholder="123456" {...field} />
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
                  <Button className="rounded-sm" variant={"outline"}>
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
                                  <Input placeholder="123456" {...field} />
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
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
