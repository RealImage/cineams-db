
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import Theatres from "./pages/Theatres";
import EditTheatre from "./pages/EditTheatre";
import Chains from "./pages/Chains";
import TDLDevices from "./pages/TDLDevices";
import WireTAPDevices from "./pages/WireTAPDevices";
import AddWireTAPDevice from "./pages/AddWireTAPDevice";
import EditWireTAPDevice from "./pages/EditWireTAPDevice";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SonnerToaster />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/theatres" element={<Theatres />} />
            <Route path="/theatre/:id/edit" element={<EditTheatre />} />
            <Route path="/chains" element={<Chains />} />
            <Route path="/tdl-devices" element={<TDLDevices />} />
            <Route path="/wiretap-devices" element={<WireTAPDevices />} />
            <Route path="/wiretap-devices/add" element={<AddWireTAPDevice />} />
            <Route path="/wiretap-devices/:id/edit" element={<EditWireTAPDevice />} />
            <Route path="/reports" element={<Reports />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
