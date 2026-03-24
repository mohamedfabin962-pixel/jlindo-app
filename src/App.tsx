import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import WorkerProfile from "./pages/WorkerProfile";
import JobListings from "./pages/JobListings";
import MyApplications from "./pages/MyApplications";
import EmployerDashboard from "./pages/EmployerDashboard";
import PostJob from "./pages/PostJob";
import JobApplicants from "./pages/JobApplicants";
import FeedbackPage from "./pages/FeedbackPage";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, profile, loading } = useAuth();

  // ⭐ wait until auth fully loads
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Checking session…</div>
      </div>
    );
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

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/jobs" element={<ProtectedRoute roles={["worker"]}><JobListings /></ProtectedRoute>} />
      <Route path="/my-applications" element={<ProtectedRoute roles={["worker"]}><MyApplications /></ProtectedRoute>} />
      <Route path="/employer/dashboard" element={<ProtectedRoute roles={["employer"]}><EmployerDashboard /></ProtectedRoute>} />
      <Route path="/employer/post-job" element={<ProtectedRoute roles={["employer"]}><PostJob /></ProtectedRoute>} />
      <Route path="/employer/job/:jobId" element={<ProtectedRoute roles={["employer"]}><JobApplicants /></ProtectedRoute>} />
      <Route path="/feedback" element={<ProtectedRoute><FeedbackPage /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
      <Route path="/profile" element={<ProtectedRoute roles={["worker"]}><WorkerProfile /></ProtectedRoute>} />
    </Routes>
  );
}

function AuthGate() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Restoring session…</div>
      </div>
    );
  }

  return (
    <>
      <AppHeader />
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
            <AuthGate />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
