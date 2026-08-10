import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { AppLayout } from '../components/layout/AppLayout';

import { Login } from '../pages/Login/Login';
import { Dashboard } from '../pages/Dashboard/Dashboard';
import { SpareParts } from '../pages/SpareParts/SpareParts';
import { Purchases } from '../pages/Purchases/Purchases';
import { CreatePurchase } from '../pages/Purchases/CreatePurchase';
import { PurchaseDetails } from '../pages/Purchases/PurchaseDetails';
import { Sales } from '../pages/Sales/Sales';
import { CreateSale } from '../pages/Sales/CreateSale';
import { SaleDetails } from '../pages/Sales/SaleDetails';
import { PrintBill } from '../pages/Sales/PrintBill';
import { PendingPayments } from '../pages/PendingPayments/PendingPayments';
import { Users } from '../pages/Users/Users';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* User Management (Admin Only) */}
          <Route path="/users" element={<Users />} />
          
          {/* Spare Parts Master */}
          <Route path="/spare-parts" element={<SpareParts />} />
          
          {/* Purchase Module */}
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/purchases/new" element={<CreatePurchase />} />
          <Route path="/purchases/:id" element={<PurchaseDetails />} />
          
          {/* Sales Module */}
          <Route path="/sales" element={<Sales />} />
          <Route path="/sales/new" element={<CreateSale />} />
          <Route path="/sales/:id" element={<SaleDetails />} />

          {/* Pending Payments Module */}
          <Route path="/pending-payments" element={<PendingPayments />} />

          {/* Redirect / to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* Printable Bill Route (outside layout so header/sidebar do not render) */}
        <Route path="/sales/:id/print" element={<PrintBill />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
