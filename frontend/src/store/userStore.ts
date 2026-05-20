import { create } from "zustand";
import axios from "axios";
import { useAuthStore } from "./authStore";

type UserStore = {
  userData: any;
  setUserData: (data: any) => void;
  getCurrentUser: () => Promise<void>;
};

export const useUserStore = create<UserStore>((set) => ({
  userData: null,

  setUserData: (data) => set({ userData: data }),

  getCurrentUser: async () => {
    try {
      const serverUrl = useAuthStore.getState().serverUrl;

      const res = await axios.get(serverUrl + "/api/user/getcurrentuser", {
        withCredentials: true,
      });

      set({ userData: res.data });

      localStorage.setItem("userContext userData", JSON.stringify(res.data));
    } catch (error) {
      set({ userData: null });
      console.log(error);
    }
  },
}));
