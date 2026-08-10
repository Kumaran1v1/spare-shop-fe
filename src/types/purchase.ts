export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID';
export type PaymentMethod = 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER' | 'OTHER';

export interface PurchaseItem {
  productId: string;
  partNumber: string;
  spareName: string;
  image?: string;
  quantity: number;
  purchasePrice: number;
  amount: number;
}

export interface PurchasePaymentRecord {
  _id: string;
  purchaseId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  paymentDate: string;
  notes?: string;
  createdBy: { _id: string; name: string };
  createdAt: string;
}

export interface Purchase {
  _id: string;
  purchaseNumber: string;
  supplierName: string;
  supplierMobile?: string;
  supplierInvoiceNumber?: string;
  purchaseDate: string;
  items: PurchaseItem[];
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
  payments?: PurchasePaymentRecord[];
}

export interface CreatePurchasePayload {
  supplierName: string;
  supplierMobile?: string;
  supplierInvoiceNumber?: string;
  purchaseDate?: string;
  items: {
    productId: string;
    quantity: number;
    purchasePrice: number;
  }[];
  discount?: number;
  tax?: number;
  paidAmount?: number;
  paymentMethod?: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
}
