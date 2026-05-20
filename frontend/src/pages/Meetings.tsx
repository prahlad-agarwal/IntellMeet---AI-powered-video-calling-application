import "../styles/Dashboard.css";
import { useNavigate } from "react-router-dom";
import { useGetMeeting } from "@/context/useGetMeeting";
import { toast } from "react-toastify";

const Meetings = () => {
  const navigate = useNavigate();
  const { meetings } = useGetMeeting();
  const url = "https://intellmeet-ai-powered-video-calling.vercel.app/lobby";

  const copyText = async () => {
    await navigator.clipboard.writeText(url);
    toast.success("Link Copied!");
  };

  return (
    <>
      <div className="screen w-[85%]" id="screen-meetings">
        <div className="meetings-header" style={{ marginBottom: "16px" }}>
          <div>
            <div className="page-title">Meetings</div>
            <div className="page-sub" style={{ marginBottom: "0" }}>
              Manage all scheduled meetings
            </div>
          </div>
          <button
            className="btn btn-primary btn-sm"
            id="meetCreateBtn"
            onClick={() => navigate("/createmeeting")}
          >
            + Create Meeting
          </button>
        </div>

        <div className="meeting-list">
          {meetings.map((meeting: any) => (
            <div className="meeting-card" key={meeting._id}>
              <div
                className="meet-icon"
                style={{ background: "rgba(34,208,110,0.1)" }}
              >
                📹
              </div>
              <div className="meet-info">
                <div className="meet-name">{meeting.title}</div>
                <div className="meet-meta">
                  <span>
                    {new Date(meeting.createdAt).toLocaleDateString()}
                  </span>
                  <span>Host: {meeting.host}</span>
                  <span>MeetingID: {meeting.meetingId}</span>
                </div>
              </div>
              <div className="meet-actions admin-only">
                <button className="btn btn-sm btn-ghost" onClick={copyText}>
                  🔗
                </button>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => navigate("/dashboard")}
                >
                  ✏️
                </button>
                <button className="btn btn-sm btn-danger">🗑</button>
              </div>

              <div className="flex flex-col">
                <span>Meeting Joining Link:-</span>
                <span
                  onClick={() => navigate("/lobby")}
                  className="text-blue-700 underline cursor-pointer"
                >
                  {url}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Meetings;
