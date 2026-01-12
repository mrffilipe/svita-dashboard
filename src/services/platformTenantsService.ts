import { api } from '../config';
import type {
  RegisterTenantRequest,
  TenantListDtoPagedResult,
  MyTenantDto,
} from '../types';

export const platformTenantsService = {
  create: async (data: RegisterTenantRequest): Promise<void> => {
    await api.post('/api/PlatformTenants', data);
  },

  list: async (page: number = 1, pageSize: number = 10): Promise<TenantListDtoPagedResult> => {
    const response = await api.get<TenantListDtoPagedResult>('/api/PlatformTenants', {
      params: { Page: page, PageSize: pageSize },
    });
    return response.data;
  },

  getMyTenants: async (): Promise<MyTenantDto[]> => {
    const response = await api.get<MyTenantDto[]>('/api/PlatformTenants/me');
    return response.data;
  },
};
