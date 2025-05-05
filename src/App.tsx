
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PreviewFocused from "./pages/PreviewFocused";
import NotFound from "./pages/NotFound";
import { PageProvider } from "./contexts/PageContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PageProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PreviewFocused />} />
            {/* Redirect old index route to root */}
            <Route path="/preview-focused" element={<Navigate to="/" replace />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </PageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
