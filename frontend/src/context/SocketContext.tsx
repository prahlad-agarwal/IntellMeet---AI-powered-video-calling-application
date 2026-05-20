import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";

import { io, Socket } from "socket.io-client";
import { useUserStore } from "@/store/userStore";

type SocketContextType = Socket | null;

const SocketContext = createContext<SocketContextType>(null);

type Props = {
  children: ReactNode;
};

export const SocketProvider = ({ children }: Props) => {
  const userData = useUserStore((state) => state.userData);

  const socket = useMemo(() => {
    if (!userData?._id) return null;

    return io("http://localhost:8000", {
      query: {
        userId: userData._id,
      },
      transports: ["websocket"],
    });
  }, [userData]);

  useEffect(() => {
    return () => {
      socket?.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const socket = useContext(SocketContext);

  if (!socket) {
    throw new Error("useSocket must be used inside SocketProvider");
  }

  return socket;
};

export default SocketContext;
