import "../styles/Room.css";
import "../styles/ChatPart.css";
import Video from "../components/ui/Video";
import { useSocket } from "../context/SocketContext";
import { createPeerConnection, getPeer, removePeer } from "../peer/peer";
import { useEffect, useRef, useState } from "react";
import { useGetMeeting } from "@/context/useGetMeeting";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuthStore } from "@/store/authStore";
import { useUserStore } from "@/store/userStore";

type MessageType = {
  sender: string;
  message: string;
  date: string;
};

type RemoteStreamType = {
  id: string;
  stream: MediaStream;
};

type ParticipantType = {
  userId: string;
  socketId: string;
  name: string;
  email: string;
};

type TypingUser = {
  userId: string;
  name: string;
};

const Room = () => {
  const serverUrl = useAuthStore((state) => state.serverUrl);
  const userData = useUserStore((state) => state.userData);
  const [activeTab, setActiveTab] = useState("chat");
  const socket = useSocket();
  const { meetings } = useGetMeeting();
  const lastMeeting = meetings[meetings.length - 1];
  const meetingId = lastMeeting?.meetingId;

  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [sRecording, setSRecording] = useState(false);
  const [stRecording, setStRecording] = useState(false);

  const [messages, setMessages] = useState<MessageType[]>([]);
  const [message, setMessage] = useState<string>("");
  const localVideo = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<RemoteStreamType[]>([]);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [participants, setParticipants] = useState<ParticipantType[]>([]);
  const recordedChunks = useRef<Blob[]>([]);

  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  [];
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const roomId = "12345";

  const createdAt = new Date(messages[messages.length - 1]?.date);
  const formattedTime = createdAt.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleTyping = (value: string) => {
    setMessage(value);

    // emit typing
    socket.emit("typing", {
      roomId,
      user: {
        _id: userData._id,
        name: userData.name,
      },
    });

    // clear old timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // stop typing after 1 second
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing", {
        roomId,
        userId: userData._id,
      });
    }, 1000);
  };

  useEffect(() => {
    startMedia();

    return () => {
      socket.off("all-users");
      socket.off("user-joined");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("receive-message");
      socket.off("show-typing");
      socket.off("hide-typing");
      socket.off("user-left");
    };
  }, []);

  const startMedia = async () => {
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setStream(localStream);

      if (localVideo.current) {
        localVideo.current.srcObject = localStream;
      }

      socket.emit("join-room", {
        roomId,
        socketId: socket.id,
        user: {
          _id: userData._id,
          name: userData.name,
          email: userData.email,
        },
      });

      // Existing users
      socket.on("all-users", async (users: ParticipantType[]) => {
        for (let user of users) {
          const peer = createPeerConnection(
            user.socketId,
            socket,
            localStream,
            addRemoteStream,
          );

          const offer = await peer.createOffer();

          await peer.setLocalDescription(offer);

          socket.emit("offer", {
            target: user.socketId,
            sdp: offer,
            caller: {
              userId: userData._id,
              socketId: socket.id,
              name: userData.name,
              email: userData.email,
            },
          });
        }
      });

      // new user joined
      socket.on("user-joined", async (user) => {
        console.log("New User Joined:- ", user);
      });

      // Receive Offer
      socket.on(
        "offer",
        async ({
          caller,
          sdp,
        }: {
          caller: {
            userId: string;
            socketId: string;
            name: string;
            email: string;
          };
          sdp: RTCSessionDescriptionInit;
        }) => {
          const peer = createPeerConnection(
            caller.socketId,
            socket,
            localStream,
            addRemoteStream,
          );

          await peer.setRemoteDescription(new RTCSessionDescription(sdp));

          const answer = await peer.createAnswer();

          await peer.setLocalDescription(answer);

          socket.emit("answer", {
            target: caller.socketId,
            sdp: answer,
            caller: {
              userId: userData._id,
              socketId: socket.id,
              name: userData.name,
              email: userData.email,
            },
          });
        },
      );

      // Receive Answer
      socket.on(
        "answer",
        async ({
          caller,
          sdp,
        }: {
          caller: {
            userId: string;
            socketId: string;
            name: string;
            email: string;
          };
          sdp: RTCSessionDescriptionInit;
        }) => {
          const peer = getPeer(caller.socketId);

          if (peer) {
            await peer.setRemoteDescription(new RTCSessionDescription(sdp));
          }
        },
      );

      // ICE Candidate
      socket.on("ice-candidate", async ({ from, candidate }) => {
        const peer = getPeer(from.socketId);

        if (peer) {
          await peer.addIceCandidate(new RTCIceCandidate(candidate));
        }
      });

      socket.on("participants", (users: ParticipantType[]) => {
        setParticipants(users);
      });

      // chat messages
      socket.on("receive-message", (data: MessageType) => {
        setMessages((prev) => [...prev, data]);
      });

      // user typing
      socket.on(
        "show-typing",
        ({ userId, name }: { userId: string; name: string }) => {
          setTypingUsers((prev) => {
            const exists = prev.find((u) => u.userId === userId);
            if (exists) return prev;

            return [...prev, { userId, name }];
          });
        },
      );

      // stop typing
      socket.on("hide-typing", ({ userId }: { userId: string }) => {
        setTypingUsers((prev) => prev.filter((user) => user.userId !== userId));
      });

      // user left
      socket.on("user-left", (userId: string) => {
        removePeer(userId);

        setRemoteStreams((prev) => prev.filter((user) => user.id !== userId));
      });
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  };

  const addRemoteStream = (userId: string, remoteStream: MediaStream) => {
    setRemoteStreams((prev) => {
      const exists = prev.find((user) => user.id === userId);

      if (exists) return prev;

      return [
        ...prev,
        {
          id: userId,
          stream: remoteStream,
        },
      ];
    });
  };

  // send message
  const sendMessage = () => {
    if (!message.trim() || !socket.id) return;

    const data = {
      sender: userData.name,
      roomId: roomId,
      message,
      date: Date.now(),
    };

    socket.emit("send-message", data);
    socket.emit("stop-typing", {
      roomId,
      userId: userData._id,
    });
    setMessage("");
  };

  // Mic mute/unmute
  const toggleMic = () => {
    if (!stream) return;

    stream.getAudioTracks()[0].enabled = !stream.getAudioTracks()[0].enabled;
    setMicOn(stream.getAudioTracks()[0].enabled);
  };

  // Camera on/off
  const toggleCamera = () => {
    if (!stream) return;

    const videoTrack = stream.getVideoTracks()[0];
    videoTrack.enabled = !stream.getVideoTracks()[0].enabled;
    setCamOn(videoTrack.enabled);
  };

  // Screen sharing
  const toggleScreenShare = async () => {
    try {
      const screen = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      const screenTrack = screen.getVideoTracks()[0];

      Object.keys(remoteStreams).forEach((userId) => {
        const peer = getPeer(userId);

        if (peer) {
          const sender = peer
            .getSenders()
            .find((s) => s.track && s.track.kind === "video");

          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        }
      });

      if (localVideo.current) {
        localVideo.current.srcObject = screen;
      }

      // Restore camera after screen share ends
      screenTrack.onended = () => {
        if (!stream) return;

        const cameraTrack = stream.getVideoTracks()[0];

        remoteStreams.forEach((user) => {
          const peer = getPeer(user.id);

          if (peer) {
            const sender = peer
              .getSenders()
              .find((s) => s.track && s.track.kind === "video");

            if (sender && cameraTrack) {
              sender.replaceTrack(cameraTrack);
            }
          }
        });

        if (localVideo.current) {
          localVideo.current.srcObject = stream;
        }
      };
    } catch (error) {
      console.error("Error sharing screen.", error);
    }
  };

  // Recording
  const startRecording = () => {
    if (!stream) return;

    recordedChunks.current = [];

    const recorder = new MediaRecorder(stream);

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recordedChunks.current.push(e.data);
      }
    };
    setSRecording(true);

    recorder.onstop = async () => {
      try {
        const blob = new Blob(recordedChunks.current, {
          type: "video/webm",
        });

        const file = new File([blob], `recording-${Date.now()}.webm`, {
          type: "video/webm",
        });

        const formData = new FormData();
        formData.append("recording", file);
        formData.append("meetingId", meetingId);

        console.log("file:- ", file);
        console.log("blob:- ", blob);

        const res = await axios.post(
          serverUrl + "/api/meeting/upload-recording",
          formData,
        );
        toast.success("Recording Save Successfully!");
        localStorage.setItem("meetingId", res.data.recording.meetingId);
      } catch (error) {
        console.log("recording error:- ", error);
        toast.error("Failed to save recording.");
      }
    };

    recorder.start();

    setMediaRecorder(recorder);
  };

  // stop recording
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setStRecording(false);
    }
  };

  // Leave call
  const leaveCall = async () => {
    stream?.getTracks().forEach((track) => track.stop());
    socket.disconnect();

    const meetingId = localStorage.getItem("meetingId");
    await axios.post(serverUrl + `/api/ai/process/${meetingId}`);
    window.location.href = `kanban/${meetingId}`;
  };

  return (
    <>
      {/* Mobile Hamburger */}
      <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
        ☰
      </button>
      <div
        className="screen room-screen"
        id="screen-room"
        style={{ padding: "0" }}
      >
        <div className="room-wrap">
          <div className="video-area">
            <div
              style={{
                background: "var(--bg2)",
                padding: "8px 14px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <span style={{ fontSize: "12px", fontWeight: "600" }}>
                {lastMeeting?.title}
              </span>
              <span
                style={{
                  fontSize: "10px",
                  background: "rgba(34,208,110,0.15)",
                  color: "var(--green)",
                  padding: "2px 8px",
                  borderRadius: "20px",
                  fontWeight: "600",
                  border: "1px solid rgba(34,208,110,0.25)",
                }}
              >
                ● LIVE
              </span>
            </div>

            <div className="video-grid">
              {camOn ? (
                <div className="v-tile speaking h-[95%] w-[95%]">
                  <div
                    className="v-avatar"
                    style={{
                      background: "linear-gradient(135deg,#4f8ef7,#7c5cfc)",
                    }}
                  >
                    {userData?.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="v-name">
                    {userData?.name.toUpperCase()} (You)
                  </div>
                </div>
              ) : (
                <div className="v-tile speaking h-[95%] w-[95%]">
                  <video ref={localVideo} autoPlay muted playsInline />
                </div>
              )}

              {remoteStreams && (
                <div className="v-tile">
                  {remoteStreams.map((user) => (
                    <Video key={user.id} stream={user.stream} />
                  ))}
                </div>
              )}
            </div>

            <div className="room-bar">
              <button
                className={`room-ctrl ${!micOn ? "on" : "off"}`}
                id="roomMic"
                title="Mic"
                onClick={() => {
                  toggleMic();
                  setMicOn(!micOn);
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
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                </svg>
              </button>
              <button
                className={`room-ctrl ${!camOn ? "on" : "off"}`}
                id="roomCam"
                title="Camera"
                onClick={() => {
                  toggleCamera();
                  setCamOn(!camOn);
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
              <button
                className={`room-ctrl ${!screenSharing ? "on" : "off"}`}
                title="Screen Share"
                onClick={() => {
                  toggleScreenShare();
                  setScreenSharing(!screenSharing);
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
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </button>
              <button
                className={`room-ctrl ${!sRecording ? "on" : "off"}`}
                title="Chat"
                onClick={() => {
                  startRecording();
                  setSRecording(!sRecording);
                }}
              >
                <svg
                  xmlns="http://w3.org"
                  viewBox="0 0 24 24"
                  width="15"
                  height="15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="room-ctrl"
                  aria-label="Recording"
                >
                  <circle cx="12" cy="12" r="8" />
                </svg>
              </button>
              <button
                className={`room-ctrl ${!stRecording ? "on" : "off"}`}
                title="Participants"
                onClick={() => {
                  stopRecording();
                  setStRecording(!stRecording);
                }}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* Outer circle */}
                  <circle cx="12" cy="12" r="10" />
                  {/* Inner stop square */}
                  <rect x="9" y="9" width="6" height="6" fill="none" />
                </svg>
              </button>
              <button
                className="room-ctrl end"
                onClick={() => {
                  leaveCall();
                }}
                title="End Call"
              >
                <svg
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* chat or participants panel */}
      <div className={`chat-panel ${sidebarOpen ? "open" : ""}`}>
        <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>
          ✕
        </button>
        <div className="chat-tabs">
          <button
            className={`ctab ${activeTab === "chat" ? "active" : ""}`}
            id="ctab-chat"
            onClick={() => {
              setActiveTab("chat");
              if (window.innerWidth < 768) setSidebarOpen(false);
            }}
          >
            Chat
          </button>

          <button
            className={`ctab ${activeTab === "participants" ? "active" : ""}`}
            id="ctab-participants"
            onClick={() => {
              setActiveTab("participants");
              if (window.innerWidth < 768) setSidebarOpen(false);
            }}
          >
            People
          </button>
        </div>
        {activeTab === "chat" && (
          <div id="chatContent">
            <div
              className="chat-msgs"
              id="chatMsgs"
              style={{ maxHeight: "calc(92vh - 16vh)" }}
            >
              <div className="chat-msg">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`chat-msg ${msg.sender === userData.name ? "justify-end" : "justify-start"}`}
                  >
                    <div className="cm-name">{msg.sender}</div>
                    <div className="cm-bubble">{msg.message}</div>
                    <span className="text-sm flex justify-end">
                      {formattedTime}
                    </span>
                  </div>
                ))}
              </div>
              {typingUsers.length > 0 && (
                <div className="typing-indicator">
                  {typingUsers.map((user) => (
                    <span key={user.userId}>{user.name}</span>
                  ))}{" "}
                  is typing...
                </div>
              )}
            </div>
            <div className="chat-input-row">
              <input
                className="chat-input"
                id="chatInputField"
                placeholder="Message everyone..."
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  handleTyping(e.target.value);
                }}
              />
              <button className="chat-send" onClick={sendMessage}>
                <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
                  <line
                    x1="22"
                    y1="2"
                    x2="11"
                    y2="13"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" fill="white" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {activeTab === "participants" && (
          <div
            id="participantsContent"
            style={{ display: "visible" }}
            className="participants-list"
          >
            {participants.map((user) => (
              <div className="part-item" key={user.name}>
                <div
                  className="part-av"
                  style={{
                    background: "linear-gradient(135deg,#4f8ef7,#7c5cfc)",
                    color: "#fff",
                  }}
                >
                  {user.name?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="part-name">{user.name}</div>
                  <div className="part-role">
                    {user.userId === userData._id ? "You" : "Participant"}
                  </div>
                </div>
                <div className="part-status">
                  <svg
                    width="12"
                    height="12"
                    fill="none"
                    stroke="var(--green)"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Room;
