import axiosClient from './axiosClient';
import { User } from '../types';

interface AuthResponse {
  token: string;
  user: User;
}

export const register = async (email: string, password: string): Promise<AuthResponse> => {
  const { data } = await axiosClient.post<AuthResponse>('/auth/register', { email, password });
  return data;
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const { data } = await axiosClient.post<AuthResponse>('/auth/login', { email, password });
  return data;
};
