const peers: Record<string, RTCPeerConnection> = {};

const configuration: RTCConfiguration = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

export const createPeerConnection = (
  userId: string,
  socket: any,
  stream: MediaStream,
  onTrack: (userId: string, stream: MediaStream) => void,
) => {
  const peerConnection = new RTCPeerConnection(configuration);

  stream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, stream);
  });

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      // send the candidate to the other peer
      console.log("ice-candidate with candidate:", event.candidate);
      socket.emit("ice-candidate", {
        target: userId,
        candidate: event.candidate,
      });
    }
  };

  peerConnection.ontrack = (event) => {
    onTrack(userId, event.streams[0]);
  };
  peers[userId] = peerConnection;
  return peerConnection;
};

export const getPeer = (userId: string) => {
  return peers[userId];
};

export const removePeer = (userId: string) => {
  if (peers[userId]) {
    peers[userId].close();
    delete peers[userId];
  }
};
