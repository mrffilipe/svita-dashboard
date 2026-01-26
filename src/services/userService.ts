import { api } from '../config';
import type { UserDto, UpdateUserRequest } from '../types';

export const userService = {
  getById: async (id: string): Promise<UserDto> => {
    const response = await api.get<UserDto>(`/api/Users/${id}`);
    return response.data;
  },

  getByEmail: async (email: string): Promise<UserDto> => {
    const response = await api.get<UserDto>(`/api/Users/${email}/by-email`);
    return response.data;
  },

  update: async (id: string, data: UpdateUserRequest): Promise<UserDto> => {
    const response = await api.put<UserDto>(`/api/Users/${id}`, data);
    return response.data;
  },

  search: async (term: string): Promise<UserDto[]> => {
    const response = await api.get<UserDto[]>(`/api/Users/search`, {
      params: { Term: term },
    });
    return response.data;
  },
};
