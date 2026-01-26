export type RequestStatus = 'AwaitingReview' | 'InProgress' | 'Completed' | 'Cancelled';

export type TypeOccurrence = 'Urgent' | 'Emergency' | 'Elective' | 'Social' | 'Other';

export type TypeOfApplicant = 
  | 'Patient' 
  | 'Administrative' 
  | 'Political' 
  | 'Driver' 
  | 'UPA' 
  | 'CommunityAgent' 
  | 'CommunityLeader' 
  | 'Other';

export interface PhoneNumber {
  value: string;
}

export interface CpfCnpj {
  value: string;
}

export interface Patient {
  name: string;
  phone: PhoneNumber;
  cpf: CpfCnpj;
  typeOfApplicant: TypeOfApplicant;
}

export interface Destination {
  value: string;
}

export interface Scheduling {
  dateTime: string;
  destination: Destination;
}

export interface AboutOccurrence {
  type: TypeOccurrence;
  description: string;
}

export interface RequestDto {
  id: string;
  patient?: Patient;
  pickup: {
    coordinate: {
      latitude: number;
      longitude: number;
    };
    address: string;
    complement?: string;
  };
  aboutOccurrence: AboutOccurrence;
  scheduling?: Scheduling;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RequestDtoPagedResult {
  items: RequestDto[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface RegisterRequestRequest {
  tenantId: string;
  userId: string;
  patient?: Patient;
  pickup: {
    coordinate: {
      latitude: number;
      longitude: number;
    };
    address: string;
    complement?: string;
  };
  aboutOccurrence: AboutOccurrence;
  scheduling?: Scheduling;
}

export interface UpdateRequestRequest {
  patient?: Patient;
  pickup: {
    coordinate: {
      latitude: number;
      longitude: number;
    };
    address: string;
    complement?: string;
  };
  aboutOccurrence: AboutOccurrence;
  scheduling?: Scheduling;
}
