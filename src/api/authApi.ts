import { axiosInstance } from './axiosInstance';
import { LoginResponse, User } from '../types/auth';

export const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<LoginResponse> => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },

  getCurrentUser: async (): Promise<{ success: boolean; data: User }> => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },
};
