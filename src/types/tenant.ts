export type TenantMemberRole = 'TenantAdmin' | 'User' | 'Driver';

export type TenantMemberStatus = 'Active' | 'Suspended' | 'Invited';

export interface DefaultAdminMember {
  email: string;
}

export interface RegisterTenantRequest {
  key: string;
  name: string;
  city: string;
  state: string;
  defaultAdminMember: DefaultAdminMember;
}

export interface TenantListDto {
  id: string;
  key: string;
  name: string;
  city: string;
  state: string;
  createdAt: string;
  updatedAt: string;
}

export interface TenantListDtoPagedResult {
  items: TenantListDto[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface MyTenantDto {
  tenantId: string;
  tenantKey: string;
  tenantName: string;
  tenantMembershipId: string;
  role: TenantMemberRole;
  status: TenantMemberStatus;
}

export interface RegisterTenantMemberRequest {
  email: string;
  role: TenantMemberRole;
}

export interface TenantMembersListDto {
  id: string;
  name: string;
  email: string;
  role: TenantMemberRole;
  status: TenantMemberStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TenantMembersListDtoPagedResult {
  items: TenantMembersListDto[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
