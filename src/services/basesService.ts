import { api } from '../config';
import type {
  RegisterBaseRequest,
  BaseListDtoPagedResult,
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
};
