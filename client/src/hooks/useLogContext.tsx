import { LogContext } from "@/context/LogContext";
import { useContext } from "react";

export const useLogContext = () => {
  const context = useContext(LogContext);
  if (!context) {
    throw new Error("useLogContext must be used within a LogProvider");
  }
  return context;
};
