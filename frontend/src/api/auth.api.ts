import apiClient from "./client";
import {
  AuthResponse,
  LoginInput,
  RegisterInput,
  SendOtpInput,
  User,
} from "../types";

export const authApi = {
  /** Step 1: Send OTP email before registration */
  sendOtp: async (payload: SendOtpInput): Promise<{ message: string; previewUrl?: string }> => {
    const { data } = await apiClient.post<{ message: string; previewUrl?: string }>(
      "/user/send-otp",
      payload
    );
    return data;
  },

  /** Step 2: Register with OTP verification */
  register: async (payload: RegisterInput): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>(
      "/user/register",
      payload
    );
    return data;
  },

  login: async (payload: LoginInput): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>(
      "/user/login",
      payload
    );
    return data;
  },

  logout: async (): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ message: string }>(
      "/user/logout"
    );
    return data;
  },

  getCurrentUser: async (): Promise<{ message: string; user: User }> => {
    const { data } = await apiClient.get<{ message: string; user: User }>(
      "/user/me"
    );
    return data;
  },

  getProfile: async (): Promise<{ message: string; user: User }> => {
    const { data } = await apiClient.get<{ message: string; user: User }>(
      "/user/profile"
    );
    return data;
  },
};
