import { api } from '../config';
import type {
  AddTenantUserRequest,
  TenantUsersListDtoPagedResult,
} from '../types';

export const tenantUsersService = {
  create: async (data: AddTenantUserRequest): Promise<void> => {
    await api.post('/api/tenants/{tenantKey}/TenantUsers', data);
  },

  list: async (
    page: number = 1,
    pageSize: number = 10
  ): Promise<TenantUsersListDtoPagedResult> => {
    const response = await api.get<TenantUsersListDtoPagedResult>(
      '/api/tenants/{tenantKey}/TenantUsers',
      {
        params: { Page: page, PageSize: pageSize },
      }
    );
    return response.data;
  },
};

// Legacy export for backward compatibility
export const tenantMembersService = tenantUsersService;
