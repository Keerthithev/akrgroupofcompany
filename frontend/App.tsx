import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";
import ScrollToTop from "./components/ScrollToTop";
import ScrollToTopButton from "./components/ScrollToTopButton";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import ConstructionAdminDashboard from "./pages/ConstructionAdminDashboard";
import Shopping from "./pages/Shopping";
import Gym from "./pages/Gym";
import Theater from "./pages/Theater";
import ServiceCenter from "./pages/ServiceCenter";
import PartyHall from "./pages/PartyHall";
import Hotel from "./pages/Hotel";
import RoomDetails from "./pages/RoomDetails";
import ReviewForm from "./pages/ReviewForm";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";

// AKR Group Company Pages
import AkrSons from "./pages/AkrSons";
import AkrConstruction from "./pages/AkrConstruction";
import Multicomplex from "./pages/Multicomplex";
import FillingStation from "./pages/FillingStation";
import WineStore from "./pages/WineStore";
import Farm from "./pages/Farm";
import Amma from "./pages/Amma";
import EasyCredit from "./pages/EasyCredit";
import AboutUs from "./pages/AboutUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter >
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        
        {/* AKR Group Company Pages */}
        <Route path="/akr-sons" element={<AkrSons />} />
        <Route path="/construction" element={<AkrConstruction />} />
        <Route path="/multicomplex" element={<Multicomplex />} />
        <Route path="/filling-station" element={<FillingStation />} />
        <Route path="/wine-store" element={<WineStore />} />
        <Route path="/farm" element={<Farm />} />
        <Route path="/amma" element={<Amma />} />
        <Route path="/easy-credit" element={<EasyCredit />} />
        
        {/* Existing Service Pages */}
        <Route path="/shopping" element={<Shopping />} />
        <Route path="/gym" element={<Gym />} />
        <Route path="/theater" element={<Theater />} />
        <Route path="/servicecenter" element={<ServiceCenter />} />
        <Route path="/partyhall" element={<PartyHall />} />
        <Route path="/hotel" element={<Hotel />} />
        <Route path="/hotel/room/:roomId" element={<RoomDetails />} />
        <Route path="/review/:bookingId/:token" element={<ReviewForm />} />
        
        {/* Admin Routes */}
        <Route path="/multicomplex/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/multicomplex/admin-login" element={<AdminLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/construction-admin/dashboard" element={<ConstructionAdminDashboard />} />
        
        {/* Payment Routes */}
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />
        
        {/* Information Pages */}
        <Route path="/about" element={<AboutUs />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      </Routes>
      <ScrollToTopButton />
    </BrowserRouter>
    <Toaster />
  </QueryClientProvider>
);

export default App;
