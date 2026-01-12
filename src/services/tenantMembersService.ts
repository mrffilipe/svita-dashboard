import { api } from '../config';
import type {
  RegisterTenantMemberRequest,
  TenantMembersListDtoPagedResult,
} from '../types';

export const tenantMembersService = {
  create: async (data: RegisterTenantMemberRequest): Promise<void> => {
    await api.post('/api/tenants/{tenantKey}/TenantMembers', data);
  },

  list: async (
    page: number = 1,
    pageSize: number = 10
  ): Promise<TenantMembersListDtoPagedResult> => {
    const response = await api.get<TenantMembersListDtoPagedResult>(
      '/api/tenants/{tenantKey}/TenantMembers',
      {
        params: { Page: page, PageSize: pageSize },
      }
    );
    return response.data;
  },
};
