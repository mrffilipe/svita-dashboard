import { api } from '../config';
import type { UserDto } from '../types';

export const userService = {
  getById: async (id: string): Promise<UserDto> => {
    const response = await api.get<UserDto>(`/api/Users/${id}`);
    return response.data;
  },

  getByEmail: async (email: string): Promise<UserDto> => {
    const response = await api.get<UserDto>(`/api/Users/${email}/by-email`);
    return response.data;
  },
};
