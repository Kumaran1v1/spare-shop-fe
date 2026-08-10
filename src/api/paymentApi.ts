import { axiosInstance } from './axiosInstance';
import { PendingPaymentsResponse } from '../types/payment';

export const paymentApi = {
  getPendingPayments: async (params?: { search?: string }): Promise<{ success: boolean; data: PendingPaymentsResponse }> => {
    const response = await axiosInstance.get('/pending-payments', { params });
    return response.data;
  },
};
