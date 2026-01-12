export type VehicleType = 'Ambulance' | 'Other';

export interface RegisterVehicleRequest {
  plate: string;
  model: string;
  year: number;
  type: VehicleType;
  baseId: string;
}

export interface BaseDto {
  id: string;
  name: string;
  code: string;
}

export interface VehicleDto {
  id: string;
  plate: string;
  model: string;
  year: number;
  type: VehicleType;
  base: BaseDto;
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

export interface AssignDriverRequest {
  driverId: string;
}

export interface UpdateVehicleCurrentLocationRequest {
  latitude: number;
  longitude: number;
}
