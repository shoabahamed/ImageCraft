import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import Home from "./pages/Home";
import MainPage from "./pages/MainPage";
import { Toaster } from "./components/ui/toaster";

export default function App() {
  return (
    <div>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
          <Routes>
            <Route path="/mainpage" element={<MainPage />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </ThemeProvider>
    </div>
  );
}
