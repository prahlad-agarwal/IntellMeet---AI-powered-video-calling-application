import { create } from "zustand";

type AuthStore = {
  serverUrl: string;
};

export const useAuthStore = create<AuthStore>(() => ({
  serverUrl: "https://intellmeet-ai-powered-video-calling.onrender.com",
}));
