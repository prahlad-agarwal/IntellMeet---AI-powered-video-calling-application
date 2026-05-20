import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import { useUserStore } from "./userStore";

type SocketStore = {
  socket: Socket | null;
  connected: boolean;
  connectSocket: () => void;
  disconnectSocket: () => void;
};

export const useSocketStore = create<SocketStore>((set, get) => ({
  socket: null,
  connected: false,
  connectSocket: () => {
    const userData = useUserStore.getState().userData;

    if (!userData?._id) return;

    // prevent duplicate connections
    if (get().socket?.connected) return;

    const socket = io("http://localhost:8000", {
      query: {
        userId: userData._id,
      },
      transports: ["websocket"],
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const socket = get().socket;

    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));
