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
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
  const [user, setUser] = useState(localStorage.getItem("user"));
  const { toast } = useToast();

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
        setUser(JSON.stringify(response.data.data));
        toast({
          description: "Log Out Successfull.",
          className: "bg-green-500 text-gray-900",
          duration: 1000,
        });
      } else {
        console.error("Signup failed:", response.data.message);
        toast({
          description: "OOps Auth Unsuccessfull.",
        });
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error("Error during signup:", error.response.data.message);
      } else {
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
        setUser(JSON.stringify(response.data.data));
        toast({
          description: "Log Out Successfull.",
          className: "bg-green-500 text-gray-900",
          duration: 1000,
        });
      } else {
        console.error("Login failed:", response.data.message);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error("Error during login:", error.response.data.message);
      } else {
        console.error("Unexpected error:", error);
      }
    }

    setIsLoginOpen(false);
  }

  const handleLogOut = () => {
    localStorage.removeItem("user");
    setUser(null);
    toast({
      description: "Log Out Successfull.",
      className: "bg-green-500 text-gray-900",
      duration: 1000,
    });
  };

  return (
    <nav className="w-full pt-3">
      <div className="flex items-center justify-between mx-3 border-b-2 border-slate-300 pb-3">
        <div className="flex items-center space-x-2">
          <p className="text-3xl font-bold italic">StyleForge</p>
        </div>
        <div className="flex gap-5">
          {user ? (
            <Button onClick={handleLogOut}>LogOut</Button>
          ) : (
            <>
              <Dialog open={isSignUpOpen} onOpenChange={setIsSignUpOpen}>
                <DialogTrigger asChild>
                  <Button className="w-28">SignUp</Button>
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
                          <Button className="w-full">SignUp</Button>
                          <Button variant="outline" className="w-full">
                            Sign with Google
                          </Button>
                        </div>
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
                      </form>
                    </Form>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                <DialogTrigger asChild>
                  <Button className="w-28">Login</Button>
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
                          <Button className="w-full">LogIn</Button>
                          <Button variant="outline" className="w-full">
                            Login with Google
                          </Button>
                        </div>
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
                      </form>
                    </Form>
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
