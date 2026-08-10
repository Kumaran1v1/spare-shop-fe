import { axiosInstance } from './axiosInstance';
import { SparePart, CreateSparePartPayload, SparePartQueryParams } from '../types/sparePart';

export const sparePartApi = {
  getAll: async (params?: SparePartQueryParams) => {
    const response = await axiosInstance.get('/spare-parts', { params });
    return response.data;
  },

  getById: async (id: string): Promise<{ success: boolean; data: SparePart }> => {
    const response = await axiosInstance.get(`/spare-parts/${id}`);
    return response.data;
  },

  create: async (payload: CreateSparePartPayload): Promise<{ success: boolean; data: SparePart }> => {
    const response = await axiosInstance.post('/spare-parts', payload);
    return response.data;
  },

  update: async (id: string, payload: Partial<CreateSparePartPayload>): Promise<{ success: boolean; data: SparePart }> => {
    const response = await axiosInstance.put(`/spare-parts/${id}`, payload);
    return response.data;
  },

  toggleStatus: async (id: string): Promise<{ success: boolean; data: SparePart }> => {
    const response = await axiosInstance.patch(`/spare-parts/${id}/status`);
    return response.data;
  },
};
