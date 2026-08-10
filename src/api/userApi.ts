import { axiosInstance } from './axiosInstance';
import { UserAccount, CreateUserPayload, UpdateUserPayload } from '../types/user';

export const userApi = {
  getAll: async (): Promise<{ success: boolean; data: UserAccount[] }> => {
    const response = await axiosInstance.get('/users');
    return response.data;
  },

  create: async (payload: CreateUserPayload): Promise<{ success: boolean; data: UserAccount }> => {
    const response = await axiosInstance.post('/users', payload);
    return response.data;
  },

  update: async (id: string, payload: UpdateUserPayload): Promise<{ success: boolean; data: UserAccount }> => {
    const response = await axiosInstance.put(`/users/${id}`, payload);
    return response.data;
  },

  toggleStatus: async (id: string): Promise<{ success: boolean; data: UserAccount }> => {
    const response = await axiosInstance.patch(`/users/${id}/status`);
    return response.data;
  },
};
