export type BaseType = 
  | 'Hospital' 
  | 'HealthCenter' 
  | 'Clinic' 
  | 'FireDepartment' 
  | 'MunicipalGarage' 
  | 'Other';

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
}

export interface Location {
  coordinate: GeoCoordinate;
  address?: string;
  complement?: string;
}

export interface RegisterBaseRequest {
  name: string;
  type: BaseType;
  location: Location;
}

export interface VehicleSummaryDto {
  id: string;
  plate: string;
  model: string;
  year: number;
  type: string;
  baseId: string;
}

export interface BaseListDto {
  id: string;
  name: string;
  code: string;
  type: BaseType;
  location: Location;
  vehicles: VehicleSummaryDto[];
  createdAt: string;
  updatedAt: string;
}

export interface BaseListDtoPagedResult {
  items: BaseListDto[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
