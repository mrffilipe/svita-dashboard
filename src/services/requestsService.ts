import { api } from '../config';
import type { RequestDto, RequestDtoPagedResult, RegisterRequestRequest } from '../types';

export const requestsService = {
  create: async (data: RegisterRequestRequest): Promise<void> => {
    await api.post('/api/tenants/{tenantKey}/Requests', data);
  },

  listByUser: async (userId: string, page: number = 1, pageSize: number = 10): Promise<RequestDtoPagedResult> => {
    const response = await api.get<RequestDtoPagedResult>(`/api/tenants/{tenantKey}/Requests/${userId}/user`, {
      params: { Page: page, PageSize: pageSize },
    });
    return response.data;
  },

  getById: async (requestId: string): Promise<RequestDto> => {
    const response = await api.get<RequestDto>(`/api/tenants/{tenantKey}/Requests/${requestId}`);
    return response.data;
  },
};
