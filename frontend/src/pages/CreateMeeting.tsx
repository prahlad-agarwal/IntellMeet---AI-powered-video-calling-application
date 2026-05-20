import "../styles/Meeting.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/authStore";

const CreateMeeting = () => {
  const navigate = useNavigate();
  const userData = useUserStore((state) => state.userData);
  const serverUrl = useAuthStore((state) => state.serverUrl);

  const [title, setTitle] = useState<string>("");
  const host = userData?.name;
  const meetingId = Math.floor(Math.random() * 1000) + 1;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      let res = await axios.post(
        serverUrl + "/api/meeting/createmeeting",
        {
          title,
          host,
          meetingId,
        },
        { withCredentials: true },
      );
      toast.success("Meeting created successfully!");
      console.log(res.data);
    } catch (error) {
      toast.error("Error creating meeting.");
      console.error("Error creating meeting:", error);
    }
  };

  return (
    <>
      <div className="h-screen w-screen flex justify-center items-center">
        <div className="" id="createMeetingModal">
          <form onSubmit={handleSubmit}>
            <div className="modal">
              <div className="modal-title">
                Create Meeting <button className="modal-close">✕</button>
              </div>
              <div className="form-group">
                <label className="form-label">Meeting Title</label>
                <input
                  className="form-input"
                  placeholder="e.g. Weekly Team Sync"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Host</label>
                <input
                  className="form-input"
                  placeholder="e.g. John Doe"
                  value={host}
                  readOnly
                />
              </div>
              <div className="form-group">
                <label className="form-label">Meeting ID</label>
                <input
                  className="form-input"
                  placeholder="Meeting Id will be auto-generated"
                  value={meetingId}
                  readOnly
                />
              </div>
              <div className="modal-actions">
                <button
                  className="btn btn-ghost"
                  onClick={() => navigate("/dashboard")}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/meetings")}
                >
                  Create
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateMeeting;
