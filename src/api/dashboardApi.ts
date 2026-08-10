import { axiosInstance } from './axiosInstance';
import { DashboardData } from '../types/dashboard';

export const dashboardApi = {
  getSummary: async (): Promise<{ success: boolean; data: DashboardData }> => {
    const response = await axiosInstance.get('/dashboard/summary');
    return response.data;
  },
};
