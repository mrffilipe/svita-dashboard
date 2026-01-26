export interface UserDto {
  id: string;
  externalAuthId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cpfCnpj: string;
  isPlatformAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  phone: string;
}
