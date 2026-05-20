import { create } from "zustand";

type AuthStore = {
  serverUrl: string;
};

export const useAuthStore = create<AuthStore>(() => ({
  serverUrl: "http://localhost:8000",
}));
