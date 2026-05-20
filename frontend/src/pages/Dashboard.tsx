import "../styles/Dashboard.css";
import { useNavigate } from "react-router-dom";
import { useGetMeeting } from "@/context/useGetMeeting";

const Dashboard = () => {
  const navigate = useNavigate();
  const { meetings } = useGetMeeting();

  return (
    <>
      <div className="w-[85%] screen active" id="screen-dashboard">
        <div className="page-title">Dashboard</div>
        <div className="page-sub" id="dashSub">
          Welcome back, Admin. Here's your meeting overview.
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-n" style={{ color: "var(--accent)" }}>
              {meetings?.length}
            </div>
            <div className="stat-l">Total Meetings</div>
            <div className="stat-d d-up">▲ 3 this week</div>
          </div>
          <div className="stat-card">
            <div className="stat-n" style={{ color: "var(--green)" }}>
              0
            </div>
            <div className="stat-l">Live Now</div>
            <div className="stat-d d-up">▲ Active</div>
          </div>
          <div className="stat-card">
            <div className="stat-n" style={{ color: "var(--amber)" }}>
              48
            </div>
            <div className="stat-l">Participants</div>
            <div className="stat-d d-up">▲ 12 joined today</div>
          </div>
          <div className="stat-card">
            <div className="stat-n" style={{ color: "#a78bfa" }}>
              {meetings?.length}
            </div>
            <div className="stat-l">Recordings</div>
          </div>
        </div>
        <div className="meetings-header">
          <h3>Upcoming & Live Meetings</h3>
          <button
            className="btn btn-primary btn-sm"
            id="dashCreateBtn"
            onClick={() => navigate("/createmeeting")}
          >
            + New Meeting
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
              <div className="meet-actions" id="dashActions1">
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => navigate("/dashboard")}
                >
                  🔗
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
