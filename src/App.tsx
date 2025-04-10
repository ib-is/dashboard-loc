
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Properties from "./pages/Properties";
import PropertyForm from "./pages/PropertyForm";
import Roommates from "./pages/Roommates";
import RoommateForm from "./pages/RoommateForm";
import Transactions from "./pages/Transactions";
import TransactionForm from "./pages/TransactionForm";
import Profile from "./pages/Profile";
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
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/properties/new" element={<PropertyForm />} />
            <Route path="/properties/edit/:id" element={<PropertyForm />} />
            <Route path="/roommates" element={<Roommates />} />
            <Route path="/roommates/new" element={<RoommateForm />} />
            <Route path="/roommates/edit/:id" element={<RoommateForm />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/transactions/new" element={<TransactionForm />} />
            <Route path="/transactions/edit/:id" element={<TransactionForm />} />
            <Route path="/profile" element={<Profile />} />
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
