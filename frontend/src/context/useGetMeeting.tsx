import { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";

export interface Meeting {
  title: string;
  host: string;
  createdAt: string;
  meetingId: string;
}

export const useGetMeeting = () => {
  const serverUrl = useAuthStore((state) => state.serverUrl);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  const getAllMeetings = async () => {
    try {
      const res = await axios.get(serverUrl + "/api/meeting/allmeetings");
      console.log(res.data);
      setMeetings(res.data);
      localStorage.setItem("meetings", JSON.stringify(res.data));
    } catch (error) {
      console.error("Error fetching meetings:", error);
    }
  };

  useEffect(() => {
    getAllMeetings();
  }, []);
  return { meetings, setMeetings };
};
