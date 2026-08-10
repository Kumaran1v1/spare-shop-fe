import { axiosInstance } from './axiosInstance';
import { Sale, CreateSalePayload } from '../types/sale';
import { RecordPaymentPayload } from '../types/payment';

export const saleApi = {
  getAll: async (params?: { search?: string; status?: string; page?: number; limit?: number }) => {
    const response = await axiosInstance.get('/sales', { params });
    return response.data;
  },

  getById: async (id: string): Promise<{ success: boolean; data: Sale }> => {
    const response = await axiosInstance.get(`/sales/${id}`);
    return response.data;
  },

  create: async (payload: CreateSalePayload): Promise<{ success: boolean; data: Sale }> => {
    const response = await axiosInstance.post('/sales', payload);
    return response.data;
  },

  receivePayment: async (id: string, payload: RecordPaymentPayload) => {
    const response = await axiosInstance.post(`/sales/${id}/payments`, payload);
    return response.data;
  },
};
