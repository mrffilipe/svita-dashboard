import { api } from '../config';
import type {
  RegisterVehicleRequest,
  VehicleDtoPagedResult,
  VehicleDto,
  AssignDriverRequest,
  UpdateVehicleCurrentLocationRequest,
} from '../types';

export const vehiclesService = {
  create: async (data: RegisterVehicleRequest): Promise<void> => {
    await api.post('/api/tenants/{tenantKey}/Vehicles', data);
  },

  list: async (page: number = 1, pageSize: number = 10): Promise<VehicleDtoPagedResult> => {
    const response = await api.get<VehicleDtoPagedResult>('/api/tenants/{tenantKey}/Vehicles', {
      params: { Page: page, PageSize: pageSize },
    });
    return response.data;
  },

  getByPlate: async (plate: string): Promise<VehicleDto> => {
    const response = await api.get<VehicleDto>('/api/tenants/{tenantKey}/Vehicles/by-plate', {
      params: { plate },
    });
    return response.data;
  },

  assignDriver: async (plate: string, data: AssignDriverRequest): Promise<void> => {
    await api.post(`/api/tenants/{tenantKey}/Vehicles/${plate}/assign-driver`, data);
  },

  unassignDriver: async (vehicleAssignmentId: string): Promise<void> => {
    await api.post('/api/tenants/{tenantKey}/Vehicles/unassign-driver', null, {
      params: { vehicleAssignmentId },
    });
  },

  updateCurrentLocation: async (
    vehicleAssignmentId: string,
    data: UpdateVehicleCurrentLocationRequest
  ): Promise<void> => {
    await api.put('/api/tenants/{tenantKey}/Vehicles/current-location', data, {
      params: { vehicleAssignmentId },
    });
  },
};
