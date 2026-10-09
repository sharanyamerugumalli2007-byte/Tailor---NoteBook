import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/public/Home';
import Services from './pages/public/Services';
import ServiceDetails from './pages/public/ServiceDetails';
import SizeGuide from './pages/public/SizeGuide';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';
import NotFound from './pages/public/NotFound';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import PlaceOrder from './pages/customer/PlaceOrder';
import MyOrders from './pages/customer/MyOrders';
import OrderDetails from './pages/customer/OrderDetails';
import Measurements from './pages/customer/Measurements';
import OrderTracking from './pages/customer/OrderTracking';
import CustomerPayments from './pages/customer/CustomerPayments';
import CustomerNotifications from './pages/customer/CustomerNotifications';
import CustomerProfile from './pages/customer/CustomerProfile';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminServices from './pages/admin/AdminServices';
import AdminPayments from './pages/admin/AdminPayments';
import AdminShipments from './pages/admin/AdminShipments';
import AdminSettings from './pages/admin/AdminSettings';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:id" element={<ServiceDetails />} />
        <Route path="/size-guide" element={<SizeGuide />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Customer Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['customer', 'admin', 'staff']} />}>
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/customer/orders" element={<MyOrders />} />
          <Route path="/customer/orders/new" element={<PlaceOrder />} />
          <Route path="/customer/orders/:id" element={<OrderDetails />} />
          <Route path="/customer/measurements" element={<Measurements />} />
          <Route path="/customer/size-guide" element={<SizeGuide />} />
          <Route path="/customer/tracking" element={<OrderTracking />} />
          <Route path="/customer/payments" element={<CustomerPayments />} />
          <Route path="/customer/notifications" element={<CustomerNotifications />} />
          <Route path="/customer/profile" element={<CustomerProfile />} />
        </Route>

        {/* Admin Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'staff']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/customers" element={<AdminCustomers />} />
          <Route path="/admin/services" element={<AdminServices />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/shipments" element={<AdminShipments />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
