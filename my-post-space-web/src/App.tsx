import { BrowserRouter, Route, Routes } from "react-router";
import SigninPage from "./pages/signin-page";
import { ThemeProvider } from "./components/theme-provider";
import Navbar from "./components/navbar";
import CreateBlogPage from "./pages/create-blog-page.tsx";
import SignupPage from "./pages/signup-page";
import AllBlogsPage from "./pages/all-blogs-page.tsx";
import BlogPage from "./pages/blog-page.tsx";
import { Toaster } from "@/components/ui/sonner";
import TestPage from "./pages/test-page.tsx";
import { Analytics } from "@vercel/analytics/react";

function App() {
  return (
    <>
      <ThemeProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <Routes>
              <Route path="/" element={<AllBlogsPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/signin" element={<SigninPage />} />
              <Route path="/blog/:id" element={<BlogPage />} />
              <Route path="/create" element={<CreateBlogPage />} />
              <Route path="/test" element={<TestPage />} />
            </Routes>
            <Toaster closeButton />
            <Analytics />
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </>
  );
}

export default App;
