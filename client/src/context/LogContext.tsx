import { createContext, useState, ReactNode, useEffect } from "react";

type logType = {
  section: string;
  tab: string;
  event: string;
  message: string;
  param?: string | null;
  objType?: string | null;
  value?: string | null;
  timestamp?: string;
};

type LogContextType = {
  logs: logType[]; // Array of log messages
  setLogs: (log: logType[]) => void;
  addLog: (log: logType) => void; // Function to add a log message
  clearLogs: () => void; // Clear all logs
};

export const LogContext = createContext<LogContextType | undefined>(undefined);

export const LogProvider = ({ children }: { children: ReactNode }) => {
  const [logs, setLogs] = useState<logType[]>([]);

  const addLog = (log: logType) => {
    const {
      section,
      tab,
      event,
      message,
      param = "",
      objType = "",
      value = "",
    } = log;
    const timestamp = new Date().toISOString();

    setLogs((prevLogs) => [
      ...prevLogs,
      { section, tab, event, message, param, objType, value, timestamp },
    ]); // Append new message
  };

  const clearLogs = () => {
    setLogs([]); // Clear all logs
  };

  // useEffect(() => {
  //   console.log(logs);
  // });

  return (
    <LogContext.Provider value={{ logs, addLog, clearLogs, setLogs }}>
      {children}
    </LogContext.Provider>
  );
};

// import React, { createContext, useState, ReactNode, useEffect } from "react";

// type LogEntry = {
//   attribute: string;
//   initialValue: any;
//   finalValue: any;
//   timestamp: Date;
// };

// interface LogContextType {
//   logs: LogEntry[];
//   addLog: (attribute: string, initialValue: any, finalValue: any) => void;
//   clearLogs: () => void;
//   getLogs: () => LogEntry[];
// }

// export const LogContext = createContext<LogContextType | undefined>(undefined);

// export const LogProvider = ({ children }: { children: ReactNode }) => {
//   const [logs, setLogs] = useState<LogEntry[]>([]);

//   const clearLogs = () => setLogs([]);
//   const getLogs = () => logs;

//   // Log the `logs` state whenever it changes
//   useEffect(() => {
//     console.log("Current Logs:", logs);
//   }, [logs]);

//   return (
//     <LogContext.Provider value={{ logs, addLog, clearLogs, getLogs }}>
//       {children}
//     </LogContext.Provider>
//   );
// };
