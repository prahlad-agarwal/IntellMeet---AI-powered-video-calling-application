import { useAuthStore } from "@/store/authStore";
import axios from "axios";

const API = axios.create({
  baseURL: useAuthStore.getState().serverUrl,
  withCredentials: true,
});

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface ProfilePayload {
  formData: FormData;
}

export const loginUser = async (data: LoginPayload) => {
  const response = await API.post("/api/user/login", data, {
    withCredentials: true,
  });
  return response.data;
};

export const signupUser = async (data: SignupPayload) => {
  const response = await API.post("/api/user/signup", data, {
    withCredentials: true,
  });
  return response.data;
};

export const profileUser = async ({ formData }: ProfilePayload) => {
  const response = await API.post("/api/user/profile-update", formData, {
    withCredentials: true,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
