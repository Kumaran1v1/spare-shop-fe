import { PaymentStatus, PaymentMethod } from './purchase';

export interface SaleItem {
  productId: string;
  partNumber: string;
  spareName: string;
  image?: string;
  quantity: number;
  sellingPrice: number;
  purchasePriceSnapshot: number;
  amount: number;
  profit: number;
}

export interface SalePaymentRecord {
  _id: string;
  saleId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  paymentDate: string;
  notes?: string;
  createdBy: { _id: string; name: string };
  createdAt: string;
}

export interface Sale {
  _id: string;
  billNumber: string;
  customerName: string;
  customerMobile?: string;
  saleDate: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  paidAmount: number;
  pendingAmount: number;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdBy: { _id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
  payments?: SalePaymentRecord[];
}

export interface CreateSalePayload {
  customerName: string;
  customerMobile?: string;
  saleDate?: string;
  items: {
    productId: string;
    quantity: number;
    sellingPrice: number;
  }[];
  discount?: number;
  tax?: number;
  paidAmount?: number;
  paymentMethod?: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
}
