import "../styles/Recordings.css";
import { useGetMeeting } from "@/context/useGetMeeting";

const Recordings = () => {
  const { meetings } = useGetMeeting();

  return (
    <>
      <div className="screen w-[85%]" id="screen-recordings">
        <div className="page-title">Recordings</div>
        <div className="page-sub">All your past meeting recordings</div>
        <div style={{ flex: "1", overflowY: "auto" }}>
          {meetings?.map((meeting: any) => (
            <div className="rec-card" key={meeting._id}>
              <video
                controls
                src={meeting.recordingUrl}
                typeof="video/webm"
                className="w-50"
              />
              <div className="rec-info">
                <div className="rec-title">{meeting.title}</div>
                <div className="rec-meta">
                  <span>
                    {new Date(meeting.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ marginTop: "6px", display: "flex", gap: "6px" }}>
                  <span
                    style={{
                      fontSize: "10px",
                      background: "rgba(79,142,247,0.12)",
                      color: "var(--accent)",
                      padding: "2px 8px",
                      borderRadius: "20px",
                    }}
                  >
                    HD 1080p
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Recordings;
