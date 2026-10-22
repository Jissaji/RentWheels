import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';
import StaffLayout from './layouts/StaffLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import CarListingPage from './pages/CarListingPage';
import CarDetailsPage from './pages/CarDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerBookingsPage from './pages/customer/CustomerBookingsPage';
import CustomerProfilePage from './pages/customer/CustomerProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCarsPage from './pages/admin/AdminCarsPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import AdminMaintenancePage from './pages/admin/AdminMaintenancePage';

// Staff Operations Pages
import StaffPickupReturnPage from './pages/staff/StaffPickupReturnPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* 1. Public Facing Pages */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="cars" element={<CarListingPage />} />
              <Route path="cars/:id" element={<CarDetailsPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* 2. Standalone Auth Pages */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* 3. Customer Protected Portal */}
            <Route path="/customer" element={<CustomerLayout />}>
              <Route index element={<Navigate to="/customer/dashboard" replace />} />
              <Route path="dashboard" element={<CustomerDashboard />} />
              <Route path="cars" element={<CarListingPage />} />
              <Route path="cars/:id" element={<CarDetailsPage />} />
              <Route path="bookings" element={<CustomerBookingsPage />} />
              <Route path="profile" element={<CustomerProfilePage />} />
            </Route>

            {/* 4. Staff Protected Portal */}
            <Route path="/staff" element={<StaffLayout />}>
              <Route index element={<Navigate to="/staff/pickup-return" replace />} />
              <Route path="pickup-return" element={<StaffPickupReturnPage />} />
              <Route path="cars" element={<CarListingPage />} />
            </Route>

            {/* 5. Admin Protected Portal */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="cars" element={<AdminCarsPage />} />
              <Route path="bookings" element={<AdminBookingsPage />} />
              <Route path="customers" element={<AdminCustomersPage />} />
              <Route path="payments" element={<AdminPaymentsPage />} />
              <Route path="maintenance" element={<AdminMaintenancePage />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
