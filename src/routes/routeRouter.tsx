import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useStore } from '../store/useStore';

// Pages
import { FrontPage } from '../pages/FrontPage';
import { AdminLogin } from '../pages/AdminLogin';
import { AdminDashboard } from '../pages/AdminDashboard';

import { PassengerLogin } from '../pages/PassengerLogin';
import { PassengerRegister } from '../pages/PassengerRegister';
import { PassengerDashboard } from '../pages/PassengerDasboard';

import { ConductorLogin } from '../pages/ConductorLogin';
import { ConductorDashboard } from '../pages/ConductorDashboard';
// import { Register } from '../pages/Register';
import { LocationPage } from '../pages/LocationPage';
import { PassengerPage } from '../pages/PassengerPage';
import { TicketPage } from '../pages/TicketPage';
import { ProfilePage } from '../pages/ProfilePage';
import { Register } from '../pages/Register';

// ✅ Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useStore();
  return user ? <>{children}</> : <Navigate to="/frontpage" replace />;
};

// ✅ Authentication Routes (Public)
const AuthRoutes = () => (
  <Routes>
    <Route path="/frontpage" element={<FrontPage />} />
    <Route path="/adminLogin" element={<AdminLogin />} />
    <Route path="/passengerLogin" element={<PassengerLogin />} />
    <Route path="/passengerRegister" element={<PassengerRegister />} />
    <Route path="/conductorLogin" element={<ConductorLogin />} />
    <Route path="/passengerDashboard" element={<PassengerDashboard />} />
    <Route path="/conductorDashboard" element={<ConductorDashboard />} />
    <Route path="/conductorRegister" element={<Register/>} />
    <Route path="/adminDashboard" element={<AdminDashboard />} />
    <Route path="*" element={<Navigate to="/frontpage" replace />} />
  </Routes>
);

// ✅ Main Application Routes (Protected)
const AppRoutes = () => (
  <Layout>
    <Routes>
      <Route path="/adminDashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/passengerDashboard" element={<ProtectedRoute><PassengerDashboard /></ProtectedRoute>} />
      <Route path="/conductorDashboard" element={<ProtectedRoute><ConductorDashboard /></ProtectedRoute>} />
      <Route path="/location" element={<ProtectedRoute><LocationPage /></ProtectedRoute>} />
      <Route path="/passengers" element={<ProtectedRoute><PassengerPage /></ProtectedRoute>} />
      <Route path="/ticket" element={<ProtectedRoute><TicketPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/conductorDashboard" replace />} />
    </Routes>
  </Layout>
);

// ✅ Root Router: Redirects to Correct Dashboard After Login
export const RootRouter = () => {
  const { user } = useStore();
  const navigate = useNavigate();

  return user ? <AppRoutes /> : <AuthRoutes />;
};
