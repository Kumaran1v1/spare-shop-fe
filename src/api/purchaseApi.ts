import { axiosInstance } from './axiosInstance';
import { Purchase, CreatePurchasePayload } from '../types/purchase';
import { RecordPaymentPayload } from '../types/payment';

export const purchaseApi = {
  getAll: async (params?: { search?: string; status?: string; page?: number; limit?: number }) => {
    const response = await axiosInstance.get('/purchases', { params });
    return response.data;
  },

  getById: async (id: string): Promise<{ success: boolean; data: Purchase }> => {
    const response = await axiosInstance.get(`/purchases/${id}`);
    return response.data;
  },

  create: async (payload: CreatePurchasePayload): Promise<{ success: boolean; data: Purchase }> => {
    const response = await axiosInstance.post('/purchases', payload);
    return response.data;
  },

  payPending: async (id: string, payload: RecordPaymentPayload) => {
    const response = await axiosInstance.post(`/purchases/${id}/payments`, payload);
    return response.data;
  },
};
