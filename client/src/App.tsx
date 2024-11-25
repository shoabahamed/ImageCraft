import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import apiClient from "./utils/appClient";

export default function Home() {
  const fetchAPI = async () => {
    try {
      const response = await apiClient.get("/users");
      console.log(response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchAPI();
  }, []);

  return (
    <div>
      <Button>Click me</Button>
    </div>
  );
}
