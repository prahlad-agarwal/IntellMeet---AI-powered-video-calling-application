import "../styles/Lobby.css";
import { useNavigate } from "react-router-dom";
import { useGetMeeting } from "@/context/useGetMeeting";
import { useEffect, useRef, useState } from "react";

const Lobby = () => {
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const navigate = useNavigate();
  const { meetings } = useGetMeeting();

  const lastMeeting = meetings[meetings.length - 1];

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCamOn(true);
      setMicOn(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const toggleCamera = async () => {
    if (!stream) {
      await startCamera();
      return;
    }
    const videoTrack = stream.getVideoTracks()[0];
    videoTrack.enabled = !videoTrack.enabled;
    setCamOn(videoTrack.enabled);
  };

  const toggleMic = () => {
    if (!stream) {
      return;
    }
    const audioTrack = stream.getAudioTracks()[0];
    audioTrack.enabled = !audioTrack.enabled;
    setMicOn(audioTrack.enabled);
  };

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [stream]);

  return (
    <>
      <div className="screen w-[85%]" id="screen-lobby">
        <div className="lobby-wrap">
          <div className="lobby-info">
            <h2>{lastMeeting?.title}</h2>
            <p>
              Hosted by {lastMeeting?.host} ·{" "}
              {new Date(lastMeeting?.createdAt).toLocaleDateString()}
            </p>
          </div>

          {!camOn ? (
            <div className="lobby-preview">
              <div className="cam-placeholder" id="camAv">
                {lastMeeting?.host.charAt(0).toUpperCase()}
              </div>
              <div className="lobby-name-badge" id="lobbyName">
                {lastMeeting?.host.charAt(0).toUpperCase() +
                  lastMeeting?.host.slice(1)}
                (You)
              </div>
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  background: "rgba(34,208,110,0.85)",
                  padding: "3px 8px",
                  borderRadius: "20px",
                  fontSize: "10px",
                  fontWeight: "600",
                }}
              >
                Ready
              </div>
            </div>
          ) : (
            <div className="lobby-preview">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover rounded-3xl"
              />
            </div>
          )}
          <div className="lobby-controls">
            <button
              className={`ctrl-btn ${micOn ? "on" : "off"}`}
              id="lobbyMic"
              title="Microphone"
              onClick={() => {
                setMicOn(!micOn);
                toggleMic();
              }}
            >
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>
            <button
              className={`ctrl-btn ${camOn ? "on" : "off"}`}
              id="lobbyCam"
              title="Camera"
              onClick={() => {
                setCamOn(!camOn);
                toggleCamera();
              }}
            >
              <svg
                width="15"
                height="15"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" />
              </svg>
            </button>
            <button className="ctrl-btn" title="Settings">
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>
          <button className="lobby-join-btn" onClick={() => navigate("/room")}>
            Join Now
          </button>
          <div style={{ fontSize: "11px", color: "var(--text3)" }}>
            By joining you agree to the meeting recording policy
          </div>
        </div>
      </div>
    </>
  );
};

export default Lobby;
