import { api } from '../config';
import type { DriverStatusDto, DriverStatusDtoPagedResult } from '../types';

export const driversService = {
  list: async (page: number = 1, pageSize: number = 10): Promise<DriverStatusDtoPagedResult> => {
    const response = await api.get<DriverStatusDtoPagedResult>('/api/tenants/{tenantKey}/drivers', {
      params: { Page: page, PageSize: pageSize },
    });
    return response.data;
  },

  getAvailable: async (): Promise<DriverStatusDto[]> => {
    const response = await api.get<DriverStatusDto[]>('/api/tenants/{tenantKey}/drivers/available');
    return response.data;
  },
};
