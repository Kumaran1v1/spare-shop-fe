import { PaymentStatus, PaymentMethod } from './purchase';

export interface PendingCustomerBill {
  _id: string;
  billNumber: string;
  customerName: string;
  customerMobile?: string;
  saleDate: string;
  grandTotal: number;
  paidAmount: number;
  pendingAmount: number;
  paymentStatus: PaymentStatus;
}

export interface PendingSupplierPurchase {
  _id: string;
  purchaseNumber: string;
  supplierName: string;
  supplierMobile?: string;
  purchaseDate: string;
  grandTotal: number;
  paidAmount: number;
  pendingAmount: number;
  paymentStatus: PaymentStatus;
}

export interface PendingPaymentsResponse {
  customerPending: PendingCustomerBill[];
  supplierPending: PendingSupplierPurchase[];
}

export interface RecordPaymentPayload {
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
}
