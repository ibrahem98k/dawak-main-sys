import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

import SupplierDashboard from "@/pages/SupplierDashboard";
import SupplierMedicines from "@/pages/SupplierMedicines";
import SupplierOrders from "@/pages/SupplierOrders";
import SupplierAnalytics from "@/pages/SupplierAnalytics";

import PharmacyDashboard from "@/pages/PharmacyDashboard";
import PharmacySuppliers from "@/pages/PharmacySuppliers";
import SupplierDetails from "@/pages/SupplierDetails";
import PharmacyOrders from "@/pages/PharmacyOrders";

import Notifications from "@/pages/Notifications";
import Settings from "@/pages/Settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />

      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      <Route path="/supplier" component={SupplierDashboard} />
      <Route path="/supplier/medicines" component={SupplierMedicines} />
      <Route path="/supplier/orders" component={SupplierOrders} />
      <Route path="/supplier/analytics" component={SupplierAnalytics} />

      <Route path="/pharmacy" component={PharmacyDashboard} />
      <Route path="/pharmacy/suppliers" component={PharmacySuppliers} />
      <Route path="/pharmacy/suppliers/:id" component={SupplierDetails} />
      <Route path="/pharmacy/orders" component={PharmacyOrders} />

      <Route path="/notifications" component={Notifications} />
      <Route path="/settings" component={Settings} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
