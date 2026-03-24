// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ThemeProvider } from "@/components/ThemeProvider"; // Fixed: Changed from @/lib/theme-provider
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { queryClient } from "@/lib/query-client";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppSidebar from "@/components/AppSidebar";
import TopBar from "@/components/TopBar";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SchoolPortal from "./pages/SchoolPortal";
import ActivityLogger from "./pages/ActivityLogger";
import BEODEOMonitor from "./pages/BEODEOMonitor";
import Recognition from "./pages/Recognition";
import EcoPassports from "./pages/EcoPassports";
import Analytics from "./pages/Analytics";
import Community from "./pages/Community";
import GovernmentResolutions from "./pages/GovernmentResolutions";
import NotFound from "./pages/NotFound";
import { Language } from "./lib/translations";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mobile Sidebar Component
const MobileSidebar = ({ lang, isOpen, onClose }: { lang: Language; isOpen: boolean; onClose: () => void }) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 z-50 transform transition-transform duration-300 lg:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex justify-end p-2">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <AppSidebar lang={lang} />
      </div>
    </>
  );
};

// Authenticated Layout Component
const AuthenticatedLayout = ({ children, lang, setLang, searchQuery, setSearchQuery }: {
  children: React.ReactNode;
  lang: Language;
  setLang: (lang: Language) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar */}
      <MobileSidebar lang={lang} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:block fixed left-0 top-0 h-full">
        <AppSidebar lang={lang} />
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Top Bar with Mobile Menu Button */}
        <div className="sticky top-0 z-30">
          <TopBar
            lang={lang}
            onToggleLang={() => setLang(lang === "en" ? "mr" : "en")}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onMenuClick={() => setSidebarOpen(true)}
            isMobile={isMobile}
          />
        </div>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

// AppContent component with routes
const AppContent = () => {
  const [lang, setLang] = useState<Language>("en");
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/" element={
        <Navigate to={user ? "/dashboard" : "/login"} />
      } />

      {/* Protected Routes - ALL USERS CAN ACCESS ALL PAGES */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AuthenticatedLayout lang={lang} setLang={setLang} searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
            <Index lang={lang} searchQuery={searchQuery} />
          </AuthenticatedLayout>
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute>
          <AuthenticatedLayout lang={lang} setLang={setLang} searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
            <Profile lang={lang} />
          </AuthenticatedLayout>
        </ProtectedRoute>
      } />

      <Route path="/school-portal" element={
        <ProtectedRoute>
          <AuthenticatedLayout lang={lang} setLang={setLang} searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
            <SchoolPortal lang={lang} />
          </AuthenticatedLayout>
        </ProtectedRoute>
      } />

      <Route path="/activity-logger" element={
        <ProtectedRoute>
          <AuthenticatedLayout lang={lang} setLang={setLang} searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
            <ActivityLogger lang={lang} />
          </AuthenticatedLayout>
        </ProtectedRoute>
      } />

      <Route path="/monitor" element={
        <ProtectedRoute>
          <AuthenticatedLayout lang={lang} setLang={setLang} searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
            <BEODEOMonitor lang={lang} />
          </AuthenticatedLayout>
        </ProtectedRoute>
      } />

      <Route path="/recognition" element={
        <ProtectedRoute>
          <AuthenticatedLayout lang={lang} setLang={setLang} searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
            <Recognition lang={lang} />
          </AuthenticatedLayout>
        </ProtectedRoute>
      } />

      <Route path="/eco-passports" element={
        <ProtectedRoute>
          <AuthenticatedLayout lang={lang} setLang={setLang} searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
            <EcoPassports lang={lang} />
          </AuthenticatedLayout>
        </ProtectedRoute>
      } />

      <Route path="/analytics" element={
        <ProtectedRoute>
          <AuthenticatedLayout lang={lang} setLang={setLang} searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
            <Analytics lang={lang} />
          </AuthenticatedLayout>
        </ProtectedRoute>
      } />

      <Route path="/community" element={
        <ProtectedRoute>
          <AuthenticatedLayout lang={lang} setLang={setLang} searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
            <Community lang={lang} />
          </AuthenticatedLayout>
        </ProtectedRoute>
      } />

      <Route path="/resolutions" element={
        <ProtectedRoute>
          <AuthenticatedLayout lang={lang} setLang={setLang} searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
            <GovernmentResolutions lang={lang} />
          </AuthenticatedLayout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Main App component with providers
const App = () => {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <AppContent />
              <Toaster />
              <Sonner />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;