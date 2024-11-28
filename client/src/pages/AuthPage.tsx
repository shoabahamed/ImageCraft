import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const AuthPage = () => {
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
    <div className="flex justify-center items-center w-screen h-screen shadow-md">
      <Tabs defaultValue="account" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signup">SignUp</TabsTrigger>
          <TabsTrigger value="login">LogIn</TabsTrigger>
        </TabsList>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardDescription className="text-center text-slate-400 font-bold">
                Create an account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
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
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardDescription className="text-center text-slate-400 font-bold">
                Login to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuthPage;
