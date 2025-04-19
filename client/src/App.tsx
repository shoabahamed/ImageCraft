import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import Home from "./pages/Home";
import { Toaster } from "./components/ui/toaster";
import { useAuthContext } from "./hooks/useAuthContext";
import Test from "./pages/Test";
import ComparePage from "./pages/ComparePage";
import { CanvasObjectsProvider } from "./context/CanvasObjectContext";
import { LogProvider } from "./context/LogContext";
import LogsPage from "./pages/LogsPage";
import LogDashboard from "./pages/LogDashboard";
import Temp from "./pages/Temp";
import UserProfilePage from "./pages/Profile";
import Gallery from "./pages/Gallery";
import AdminPanel from "./pages/Admin";

export default function App() {
  const { user, loading } = useAuthContext();

  if (loading) {
    return <div>Loading...</div>; // Replace with your preferred loading spinner/component
  }

  return (
    <div>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />

            <Route
              path="/mainpage"
              element={
                <LogProvider>
                  <CanvasObjectsProvider>
                    {/* <MainPage /> */}

                    <Test />
                  </CanvasObjectsProvider>
                </LogProvider>
              }
            />

            <Route path="/gallery" element={<Gallery />} />
            <Route path="/temp/:projectId" element={<Temp />} />

            <Route
              path="/admin"
              element={
                user && user.role === "admin" ? <AdminPanel /> : <Home />
                // user && user.role === "admin" ? <AdminPanel2 /> : <Home />
              }
            />

            {/* compare page and logspage are redundant */}
            <Route
              path="/admin/compare_img"
              element={
                user && user.role === "admin" ? <ComparePage /> : <Home />
              }
            />

            <Route
              path="/admin/view_logs"
              element={user && user.role === "admin" ? <LogsPage /> : <Home />}
            />

            <Route
              path="/log_dashboard/:projectId"
              element={<LogDashboard />}
            />

            <Route
              path="/profile/:userId"
              element={
                <LogProvider>
                  <CanvasObjectsProvider>
                    <UserProfilePage />
                  </CanvasObjectsProvider>
                </LogProvider>
              }
            />
          </Routes>

          <Toaster />
        </BrowserRouter>
      </ThemeProvider>
    </div>
  );
}
