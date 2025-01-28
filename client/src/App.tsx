import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import Home from "./pages/Home";
import MainPage from "./pages/MainPage";
import { Toaster } from "./components/ui/toaster";
import { useAuthContext } from "./hooks/useAuthContext";
import Test from "./pages/Test";
import Projects from "./pages/Projects";
import Gallery from "./pages/Gallery";
import AdminPanel from "./pages/Admin";
import ComparePage from "./pages/ComparePage";
import UserDashboard from "./pages/UserProfile";
import { CanvasObjectsProvider } from "./context/CanvasObjectContext";
import { LogProvider } from "./context/LogContext";
import LogsPage from "./pages/LogsPage";
import LogDashboard from "./pages/LogDashboard";

export default function App() {
  const { user, loading } = useAuthContext();

  if (loading) {
    return <div>Loading...</div>; // Replace with your preferred loading spinner/component
  }

  return (
    <div>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />

            <Route
              path="/mainpage"
              element={
                user ? (
                  <LogProvider>
                    <CanvasObjectsProvider>
                      {/* <MainPage /> */}

                      <Test />
                    </CanvasObjectsProvider>
                  </LogProvider>
                ) : (
                  <Home />
                )
              }
            />

            <Route
              path="/profile"
              element={user ? <UserDashboard /> : <Home />}
            />

            <Route path="/gallery" element={<Gallery />} />

            <Route
              path="/admin"
              element={
                user && user.role === "admin" ? <AdminPanel /> : <Home />
              }
            />

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

            <Route path="/projects" element={user ? <Projects /> : <Home />} />

            <Route
              path="/log_dashboard/:projectId"
              element={<LogDashboard />}
            />
          </Routes>

          <Toaster />
        </BrowserRouter>
      </ThemeProvider>
    </div>
  );
}
