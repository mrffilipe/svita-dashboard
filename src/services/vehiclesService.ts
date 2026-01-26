import { api } from '../config';
import type {
  RegisterVehicleRequest,
  VehicleDtoPagedResult,
  VehicleDto,
  StartShiftRequest,
  UpdateVehicleRequest,
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

  update: async (plate: string, data: UpdateVehicleRequest): Promise<VehicleDto> => {
    const response = await api.put<VehicleDto>(`/api/tenants/{tenantKey}/Vehicles/${plate}`, data);
    return response.data;
  },

  delete: async (plate: string): Promise<void> => {
    await api.delete(`/api/tenants/{tenantKey}/Vehicles/${plate}`);
  },

  startShift: async (plate: string, data: StartShiftRequest): Promise<void> => {
    await api.post(`/api/tenants/{tenantKey}/Vehicles/${plate}/start-shift`, data);
  },

  endShift: async (driverShiftId: string): Promise<void> => {
    await api.post('/api/tenants/{tenantKey}/Vehicles/end-shift', null, {
      params: { driverShiftId },
    });
  },
};
