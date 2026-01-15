export type VehicleType = 'Ambulance' | 'Other';

export interface RegisterVehicleRequest {
  plate: string;
  model: string;
  year: number;
  type: VehicleType;
  baseId: string;
}

export interface BaseSummaryDto {
  id: string;
  name: string;
  code: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleDto {
  id: string;
  plate: string;
  model: string;
  year: number;
  type: VehicleType;
  base: BaseSummaryDto;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleDtoPagedResult {
  items: VehicleDto[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface StartShiftRequest {
  driverTenantUserId: string;
  startingLocation: {
    coordinate: {
      latitude: number;
      longitude: number;
    };
    speed?: number;
    timestamp: string;
  };
}
