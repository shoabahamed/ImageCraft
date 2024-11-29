
import { ModeToggle } from "./ui/mode-toggle";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

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
        } else {
          console.error("Signup failed:", response.data.message);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          console.error("Error during signup:", error.response.data.message);
        } else {
          console.error("Unexpected error:", error);
        }
      }
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
    }

  return (
    <nav className="w-full pt-3">
      <div className="flex items-center justify-between mx-3 border-b-2 border-slate-300 pb-3">
        <div className="flex items-center space-x-2">
          <p className="text-3xl font-bold italic">StyleForge</p>
        </div>
        <div className="flex gap-5">
          <Dialog>
          <DialogTrigger asChild>
          <Button className="w-28">SignUp</Button>
          </DialogTrigger>
          <DialogContent>
          <div>
            <DialogHeader>
              <DialogTitle className="text-center mb-8">Create an account</DialogTitle>
            </DialogHeader>
            <div className="space-y-1">
              <Form {...signupform}>
                <form
                  onSubmit={signupform.handleSubmit(handleSignUp)}
                  className="space-y-4"
                >
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
                          <Input placeholder="john@gmail.com" {...field} />
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
                </form>
              </Form>
            </div>
        </div>
          </DialogContent>
          </Dialog>

            <Dialog>
            <DialogTrigger asChild>
          <Button className="w-28">LogIn</Button>
      </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-center mb-8">Login to get started</DialogTitle>
              </DialogHeader>
              <div>
                <Form {...loginform}>
                <form
                  onSubmit={loginform.handleSubmit(handleLogIn)}
                  className="space-y-4"
                >
                  <FormField
                    control={loginform.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="john@gmail.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginform.control}
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
                  <Button className="w-full">LogIn</Button>
                </form>
              </Form>
              </div>
            </DialogContent>
            </Dialog>

        

          <ModeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
