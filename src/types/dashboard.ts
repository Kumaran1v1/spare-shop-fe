import { SparePart } from './sparePart';
import { Sale } from './sale';

export interface DashboardSummary {
  todaySales: number;
  todayPurchase: number;
  todayCollection: number;
  customerPending: number;
  supplierPending: number;
  totalSpareParts: number;
  lowStockCount: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  recentSales: Partial<Sale>[];
  lowStockSpares: Partial<SparePart>[];
}
