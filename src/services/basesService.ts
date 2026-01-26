import { api } from '../config';
import type {
  RegisterBaseRequest,
  BaseListDtoPagedResult,
  UpdateBaseRequest,
  BaseListDto,
} from '../types';

export const basesService = {
  create: async (data: RegisterBaseRequest): Promise<void> => {
    await api.post('/api/tenants/{tenantKey}/Bases', data);
  },

  list: async (page: number = 1, pageSize: number = 10): Promise<BaseListDtoPagedResult> => {
    const response = await api.get<BaseListDtoPagedResult>('/api/tenants/{tenantKey}/Bases', {
      params: { Page: page, PageSize: pageSize },
    });
    return response.data;
  },

  update: async (id: string, data: UpdateBaseRequest): Promise<BaseListDto> => {
    const response = await api.put<BaseListDto>(`/api/tenants/{tenantKey}/Bases/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/tenants/{tenantKey}/Bases/${id}`);
  },
};
