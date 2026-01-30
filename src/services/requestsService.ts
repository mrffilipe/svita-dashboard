import { api } from '../config';
import type { RequestDto, RequestDtoPagedResult, RegisterRequestRequest, UpdateRequestRequest } from '../types';

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

  update: async (requestId: string, data: UpdateRequestRequest): Promise<RequestDto> => {
    const response = await api.put<RequestDto>(`/api/tenants/{tenantKey}/Requests/${requestId}`, data);
    return response.data;
  },

  getAll: async (filters?: {
    userTerms?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }): Promise<RequestDtoPagedResult> => {
    const params: any = {};
    
    if (filters?.userTerms) params.UserTerms = filters.userTerms;
    if (filters?.status) params.Status = filters.status;
    if (filters?.startDate) params.StartDate = filters.startDate;
    if (filters?.endDate) params.EndDate = filters.endDate;
    if (filters?.page) params.Page = filters.page;
    if (filters?.pageSize) params.PageSize = filters.pageSize;

    const response = await api.get<RequestDtoPagedResult>(`/api/tenants/{tenantKey}/Requests`, { params });
    return response.data;
  },
};
