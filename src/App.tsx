
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import Theatres from "./pages/Theatres";
import EditTheatre from "./pages/EditTheatre";
import Chains from "./pages/Chains";
import TDLDevices from "./pages/TDLDevices";
import WireTAPDevices from "./pages/WireTAPDevices";
import AddWireTAPDevice from "./pages/AddWireTAPDevice";
import EditWireTAPDevice from "./pages/EditWireTAPDevice";
import TaskManagement from "./pages/TaskManagement";
import ImageManagement from "./pages/ImageManagement";
import FleetTaskEdit from "./pages/FleetTaskEdit";
import FleetTaskView from "./pages/FleetTaskView";
import ManageVersions from "./pages/ManageVersions";
import FleetStatus from "./pages/FleetStatus";
import Reports from "./pages/Reports";
import ApprovalsConflicts from "./pages/ApprovalsConflicts";
import CompanyClaims from "./pages/CompanyClaims";
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
            {/* Fleet Management Routes */}
            <Route path="/fleet-management" element={<Navigate to="/fleet-management/status" replace />} />
            <Route path="/fleet-management/status" element={<FleetStatus />} />
            <Route path="/fleet-management/tasks" element={<TaskManagement />} />
            <Route path="/fleet-management/tasks" element={<TaskManagement />} />
            <Route path="/fleet-management/images" element={<ImageManagement />} />
            <Route path="/fleet-management/images/:imageId/versions" element={<ManageVersions />} />
            <Route path="/fleet-management/task/new" element={<FleetTaskEdit />} />
            <Route path="/fleet-management/task/:id/edit" element={<FleetTaskEdit />} />
            <Route path="/fleet-management/task/:id/view" element={<FleetTaskView />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/approvals-conflicts" element={<ApprovalsConflicts />} />
            <Route path="/approvals-conflicts/company-claims" element={<CompanyClaims />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
