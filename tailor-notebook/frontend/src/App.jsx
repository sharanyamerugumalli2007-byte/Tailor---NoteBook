import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/customers/Customers';
import CustomerForm from './pages/customers/CustomerForm';
import CustomerDetails from './pages/customers/CustomerDetails';
import CustomerHistory from './pages/customers/CustomerHistory';
import Measurements from './pages/measurements/Measurements';
import MeasurementForm from './pages/measurements/MeasurementForm';
import MeasurementHistory from './pages/measurements/MeasurementHistory';
import Orders from './pages/orders/Orders';
import OrderForm from './pages/orders/OrderForm';
import OrderDetails from './pages/orders/OrderDetails';
import Appointments from './pages/appointments/Appointments';
import Notifications from './pages/notifications/Notifications';
import Profile from './pages/profile/Profile';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/new" element={<CustomerForm />} />
          <Route path="customers/:id" element={<CustomerDetails />} />
          <Route path="customers/:id/edit" element={<CustomerForm />} />
          <Route path="customers/:id/history" element={<CustomerHistory />} />
          <Route path="measurements" element={<Measurements />} />
          <Route path="customers/:customerId/measurements/new" element={<MeasurementForm />} />
          <Route path="customers/:customerId/measurements/history" element={<MeasurementHistory />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/new" element={<OrderForm />} />
          <Route path="orders/:id" element={<OrderDetails />} />
          <Route path="orders/:id/edit" element={<OrderForm />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
