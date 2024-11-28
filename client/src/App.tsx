import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import Home from "./pages/Home";
import AuthPage from "./pages/AuthPage";

export default function App() {
  return (
    <div>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
          <Routes>
            <Route path="/authpage" element={<AuthPage />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </div>
  );
}