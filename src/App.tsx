import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Simulation from "./pages/Simulation";
import Rewards from "./pages/Rewards";
import History from "./pages/History";
import PhotoCheck from "./pages/PhotoCheck";
import PhotoCheckHistory from "./pages/PhotoCheckHistory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard/:farmId" element={<Dashboard />} />
          <Route path="/simulation/:farmId" element={<Simulation />} />
          <Route path="/photo-check/:farmId" element={<PhotoCheck />} />
          <Route path="/photo-check-history/:farmId" element={<PhotoCheckHistory />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/history" element={<History />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
