export interface SparePart {
  _id: string;
  partNumber: string;
  name: string;
  image?: string;
  category: string;
  brand?: string;
  machineType?: string;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  minimumStock: number;
  currentStock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSparePartPayload {
  partNumber: string;
  name: string;
  image?: string;
  category: string;
  brand?: string;
  machineType?: string;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  minimumStock?: number;
}

export interface SparePartQueryParams {
  search?: string;
  category?: string;
  brand?: string;
  machineType?: string;
  status?: string;
  page?: number;
  limit?: number;
}
