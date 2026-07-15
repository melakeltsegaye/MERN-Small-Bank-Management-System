import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import ProtectedRoute from "../components/common/ProtectedRoute";
import DashboardLayout from "../components/layout/DashboardLayout";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import NotFound from "../pages/NotFound";
import Unauthorized from "../pages/Unauthorized";

import CustomerDashboard from "../pages/customer/CustomerDashboard";
import Deposit from "../pages/customer/Deposit";
import Withdraw from "../pages/customer/Withdraw";
import Transfer from "../pages/customer/Transfer";
import TransactionHistory from "../pages/customer/TransactionHistory";
import LoanApply from "../pages/customer/LoanApply";
import MyLoans from "../pages/customer/MyLoans";

import EmployeeDashboard from "../pages/employee/EmployeeDashboard";
import LoanQueue from "../pages/loanofficer/LoanQueue";

import ManagerDashboard from "../pages/manager/ManagerDashboard";
import LoanApprovals from "../pages/manager/LoanApprovals";
import AccountsOverview from "../pages/manager/AccountsOverview";

import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageEmployees from "../pages/admin/ManageEmployees";

const RoleDashboard = () => {
  const { user } = useAuth();
  switch (user?.role) {
    case "customer":
      return <CustomerDashboard />;
    case "employee":
      return <EmployeeDashboard />;
    case "loan_officer":
      return <LoanQueue />;
    case "manager":
      return <ManagerDashboard />;
    case "admin":
      return <AdminDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<RoleDashboard />} />

        {/* customer-only */}
        <Route path="/deposit" element={<ProtectedRoute roles={["customer"]}><Deposit /></ProtectedRoute>} />
        <Route path="/withdraw" element={<ProtectedRoute roles={["customer"]}><Withdraw /></ProtectedRoute>} />
        <Route path="/transfer" element={<ProtectedRoute roles={["customer"]}><Transfer /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute roles={["customer"]}><TransactionHistory /></ProtectedRoute>} />
        <Route path="/loans/apply" element={<ProtectedRoute roles={["customer"]}><LoanApply /></ProtectedRoute>} />
        <Route path="/loans/mine" element={<ProtectedRoute roles={["customer"]}><MyLoans /></ProtectedRoute>} />

        {/* employee */}
        <Route path="/accounts" element={
          <ProtectedRoute roles={["employee", "manager", "admin"]}>
            <RoleAwareAccounts />
          </ProtectedRoute>
        } />

        {/* loan officer + manager/admin */}
        <Route path="/loans" element={
          <ProtectedRoute roles={["loan_officer", "manager", "admin"]}>
            <RoleAwareLoans />
          </ProtectedRoute>
        } />

        {/* manager/admin */}
        <Route path="/employees" element={<ProtectedRoute roles={["admin", "manager"]}><ManageEmployees /></ProtectedRoute>} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Renders the right accounts view depending on role
const RoleAwareAccounts = () => {
  const { user } = useAuth();
  if (user?.role === "employee") return <EmployeeDashboard />;
  return <AccountsOverview />;
};

// Renders the right loans view depending on role
const RoleAwareLoans = () => {
  const { user } = useAuth();
  if (user?.role === "loan_officer") return <LoanQueue />;
  return <LoanApprovals />;
};

export default AppRoutes;
