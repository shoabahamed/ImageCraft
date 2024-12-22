import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import Home from "./pages/Home";
import MainPage from "./pages/MainPage";
import { Toaster } from "./components/ui/toaster";
import { useAuthContext } from "./hooks/useAuthContext";
import Test from "./pages/Test";
import Projects from "./pages/Projects";

export default function App() {
  const { user } = useAuthContext();

  return (
    <div>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
          <Routes>
            <Route path="/mainpage" element={user ? <MainPage /> : <Home />} />
          </Routes>
          <Routes>
            <Route path="/projects" element={user ? <Projects /> : <Home />} />
          </Routes>
          <Routes>
            <Route path="/test" element={<Test />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </ThemeProvider>
    </div>
  );
}
