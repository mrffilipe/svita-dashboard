/**
 * Traduz TenantMemberRole para português
 */
export const translateTenantMemberRole = (role: string): string => {
  switch (role) {
    case 'TenantAdmin':
      return 'Administrador';
    case 'TenantUser':
      return 'Usuário';
    case 'Driver':
      return 'Motorista';
    default:
      return role;
  }
};

/**
 * Traduz TenantMemberStatus para português
 */
export const translateTenantMemberStatus = (status: string): string => {
  switch (status) {
    case 'Active':
      return 'Ativo';
    case 'Inactive':
      return 'Inativo';
    case 'Pending':
      return 'Pendente';
    case 'Suspended':
      return 'Suspenso';
    default:
      return status;
  }
};

/**
 * Traduz BaseType para português
 */
export const translateBaseType = (type: string): string => {
  switch (type) {
    case 'Hospital':
      return 'Hospital';
    case 'Clinic':
      return 'Clínica';
    case 'HealthCenter':
      return 'Centro de Saúde';
    case 'UPA':
      return 'UPA';
    case 'FireDepartment':
      return 'Corpo de Bombeiros';
    case 'MunicipalGarage':
      return 'Garagem Municipal';
    case 'Other':
      return 'Outro';
    default:
      return type;
  }
};

/**
 * Traduz VehicleType para português
 */
export const translateVehicleType = (type: string): string => {
  switch (type) {
    case 'Ambulance':
      return 'Ambulância';
    case 'Other':
      return 'Outro';
    default:
      return type;
  }
};
