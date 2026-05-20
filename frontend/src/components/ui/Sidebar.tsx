import "../../styles/Sidebar.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/store/userStore";

const Sidebar = () => {
  const navigate = useNavigate();
  const userData = useUserStore((state) => state.userData);
  const [activeItem, setActiveItem] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile Hamburger */}
      <button
        className="sidebar-hamburger"
        onClick={() => setSidebarOpen(true)}
      >
        ☰
      </button>
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
          ✕
        </button>
        <div className="snav-section">
          <div className="snav-label">Main</div>
          <button
            className={`snav-item ${activeItem === "dashboard" ? "active" : ""}`}
            onClick={() => {
              navigate("/dashboard");

              if (window.innerWidth < 768) {
                setSidebarOpen(false);
              }
              setActiveItem("dashboard");
            }}
            id="nav-dashboard"
          >
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            Dashboard
          </button>
          <button
            className={`snav-item ${activeItem === "meetings" ? "active" : ""}`}
            onClick={() => {
              navigate("/meetings");
              setActiveItem("meetings");
            }}
            id="nav-meetings"
          >
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <rect x="2" y="5" width="20" height="15" rx="2" />
              <path d="M16 10l4-3v10l-4-3" />
            </svg>
            Meetings
          </button>
          <button
            className={`snav-item ${activeItem === "lobby" ? "active" : ""}`}
            onClick={() => {
              navigate("/lobby");
              setActiveItem("lobby");
            }}
            id="nav-lobby"
          >
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            Join Meeting
          </button>
          <button
            className={`snav-item ${activeItem === "room" ? "active" : ""}`}
            onClick={() => {
              navigate("/room");
              setActiveItem("room");
            }}
            id="nav-room"
          >
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
            </svg>
            Live Room
          </button>
          <button
            className={`snav-item ${activeItem === "recordings" ? "active" : ""}`}
            onClick={() => {
              navigate("/recordings");
              setActiveItem("recordings");
            }}
          >
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <polygon points="10 8 16 12 10 16 10 8" />
            </svg>
            Recordings
          </button>
          <button
            className={`snav-item ${activeItem === "/kanban" ? "active" : ""}`}
            onClick={() => {
              navigate("/kanban/:meetingId");
              setActiveItem("/kanban");
            }}
          >
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <polygon points="10 8 16 12 10 16 10 8" />
            </svg>
            Kanban Board
          </button>
        </div>
        {userData?.role == "admin" ? (
          <div className="snav-section" id="adminSection">
            <div className="snav-label">Admin</div>
            <button
              className={`snav-item ${activeItem === "createmeeting" ? "active" : ""}`}
              onClick={() => {
                navigate("/createmeeting");
                setActiveItem("createmeeting");
              }}
            >
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              Create Meeting
            </button>
          </div>
        ) : (
          ""
        )}
      </div>
    </>
  );
};

export default Sidebar;
