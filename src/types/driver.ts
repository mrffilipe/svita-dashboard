import type { GeoCoordinate } from './base';
import type { VehicleSummaryDto } from './base';

export interface CurrentLocation {
  coordinate: GeoCoordinate;
  speed?: number;
  timestamp: string;
}

export interface ActiveShiftSummaryDto {
  driverShiftId: string;
  currentLocation: CurrentLocation;
  vehicle: VehicleSummaryDto;
}

export interface DriverStatusDto {
  tenantUserId: string;
  driverProfileId: string;
  name: string;
  isOnline: boolean;
  activeShift?: ActiveShiftSummaryDto;
}

export interface DriverStatusDtoPagedResult {
  items: DriverStatusDto[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
