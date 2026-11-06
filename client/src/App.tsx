import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import Home from "./pages/Home";
import { Toaster } from "./components/ui/toaster";
import { useAuthContext } from "./hooks/useAuthContext";
import Test from "./pages/Test";
import { CanvasObjectsProvider } from "./context/CanvasObjectContext";
import { LogProvider } from "./context/LogContext";
import LogDashboard from "./pages/LogDashboard";
import Temp from "./pages/Temp";
import UserProfilePage from "./pages/Profile";
import Gallery from "./pages/Gallery";
import TemplateUpload from "./pages/TemplateUpload";
import AdminPanelAdvanced from "./pages/AdminPanelAdvanced";
import Pricing from "./pages/Pricing";
import ErrorPage from "./pages/Error";
import SuccessPage from "./pages/SuccessPage";
import LoadingScreen from "./components/LoadingScreen";

export default function App() {
  const { user, loading } = useAuthContext();

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      {/* Keep the loader inside ThemeProvider so the `.dark` class is applied on
          <html> before first paint — otherwise a dark-mode user gets a flash. */}
      {loading ? (
        <LoadingScreen text="Preparing Image Craft..." />
      ) : (
        <div>
          <BrowserRouter>
            <LogProvider>
              <CanvasObjectsProvider>
                <Routes>
                  <Route path="/" element={<Home />} />

                  <Route path="/mainpage" element={<Test />} />

                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/temp" element={<Temp />} />

                  <Route
                    path="/admin"
                    element={
                      user && user.role.includes("admin") ? (
                        <AdminPanelAdvanced />
                      ) : (
                        <Home />
                      )
                    }
                  />

                  <Route
                    path="/admin/templates/upload"
                    element={
                      user && user.role.includes("admin") ? (
                        <TemplateUpload />
                      ) : (
                        <Home />
                      )
                    }
                  />

                  <Route
                    path="/log_dashboard/:projectId"
                    element={<LogDashboard />}
                  />

                  <Route
                    path="/profile/:userId"
                    element={<UserProfilePage />}
                  />

                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/success" element={<SuccessPage />} />
                  <Route path="/*" element={<ErrorPage />} />

                  {/* <Route path="/admin_advanced" element={<AdminPanelAdvanced />} /> */}
                </Routes>
              </CanvasObjectsProvider>
            </LogProvider>

            <Toaster />
          </BrowserRouter>
        </div>
      )}
    </ThemeProvider>
  );
}
