import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";

import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import WorkerProfile from "./pages/WorkerProfile";
import Profile from "./pages/Profile";
import EditJob from "./pages/EditJob";
import JobListings from "./pages/JobListings";
import MyApplications from "./pages/MyApplications";
import EmployerDashboard from "./pages/EmployerDashboard";
import PostJob from "./pages/PostJob";
import JobApplicants from "./pages/JobApplicants";
import FeedbackPage from "./pages/FeedbackPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import About from "./pages/About";

import { BrandedLoadingScreen } from "@/components/BrandedLoading";

const queryClient = new QueryClient();

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, profile, loading } = useAuth();

  // ⭐ wait until auth fully loads
  if (loading) {
    return <BrandedLoadingScreen message="Checking session..." />;
  }

  // ⭐ if still no user → go login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ⭐ if role restriction exists
  if (roles && profile && !roles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <BrandedLoadingScreen message="Checking admin session..." />;
  }

  if (!user || (profile && profile.role !== "admin")) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/jobs" element={<ProtectedRoute roles={["worker"]}><JobListings /></ProtectedRoute>} />
      <Route path="/my-applications" element={<ProtectedRoute roles={["worker"]}><MyApplications /></ProtectedRoute>} />
      <Route path="/employer/dashboard" element={<ProtectedRoute roles={["employer"]}><EmployerDashboard /></ProtectedRoute>} />
      <Route path="/employer/post-job" element={<ProtectedRoute roles={["employer"]}><PostJob /></ProtectedRoute>} />
      <Route path="/employer/job/:jobId" element={<ProtectedRoute roles={["employer"]}><JobApplicants /></ProtectedRoute>} />
      <Route path="/feedback" element={<ProtectedRoute><FeedbackPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
  path="/employer/edit-job/:jobId"
  element={
    <ProtectedRoute roles={["employer"]}>
      <EditJob />
    </ProtectedRoute>
  }
/>
      <Route path="/about" element={<About />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/profile" element={<ProtectedRoute roles={["worker"]}><WorkerProfile /></ProtectedRoute>} />
    </Routes>
  );
}

function AuthGate() {
  const { loading } = useAuth();
  const location = useLocation();
  const hideHeader = ["/login", "/signup", "/forgot-password", "/reset-password", "/admin/login"].includes(location.pathname);

  if (loading) {
    return <BrandedLoadingScreen message="Restoring session..." />;
  }

  return (
    <>
      {!hideHeader && <AppHeader />}
      {!hideHeader && <AnnouncementBanner />}
      <AppRoutes />
    </>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AuthProvider>
            <div className="min-h-screen bg-gray-50 text-gray-900">
  <AuthGate />
</div>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
