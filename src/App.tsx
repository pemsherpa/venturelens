import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

// Auth
import Auth from "./pages/Auth";

// VC Pages
import VCDashboardPage from "./pages/vc/VCDashboardPage";
import VCPortfolio from "./pages/vc/VCPortfolio";
import VCAlerts from "./pages/vc/VCAlerts";
import VCSettings from "./pages/vc/VCSettings";

// Founder Pages
import FounderHomePage from "./pages/founder/FounderHomePage";
import FounderUploadPage from "./pages/founder/FounderUploadPage";
import FounderChatPage from "./pages/founder/FounderChatPage";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            
            {/* VC Routes */}
            <Route path="/" element={<ProtectedRoute allowedRoles={["vc"]}><VCDashboardPage /></ProtectedRoute>} />
            <Route path="/portfolio" element={<ProtectedRoute allowedRoles={["vc"]}><VCPortfolio /></ProtectedRoute>} />
            <Route path="/alerts" element={<ProtectedRoute allowedRoles={["vc"]}><VCAlerts /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute allowedRoles={["vc"]}><VCSettings /></ProtectedRoute>} />
            
            {/* Founder Routes */}
            <Route path="/founder-home" element={<ProtectedRoute allowedRoles={["founder"]}><FounderHomePage /></ProtectedRoute>} />
            <Route path="/founder-upload" element={<ProtectedRoute allowedRoles={["founder"]}><FounderUploadPage /></ProtectedRoute>} />
            <Route path="/founder-chat" element={<ProtectedRoute allowedRoles={["founder"]}><FounderChatPage /></ProtectedRoute>} />
            <Route path="/founder-analytics" element={<ProtectedRoute allowedRoles={["founder"]}><FounderHomePage /></ProtectedRoute>} />
            <Route path="/founder-settings" element={<ProtectedRoute allowedRoles={["founder"]}><FounderHomePage /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
