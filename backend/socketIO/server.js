import { Server } from "socket.io";
import http from "http";
import express from "express";
import Meeting from "../models/meeting.model.js";
import { redisClient } from "../config/redis.js";
const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT"],
  },
});

// real time message code
export const getReceiverSocketId = (receiverId) => {
  return users[receiverId];
};

const rooms = {};

// used to listen events on server side
io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  console.log("userId:- ", userId);

  // join room
  socket.on("join-room", async ({ roomId, socketId, user }) => {
    console.log("user join room with data:", { roomId, socketId, user });
    socket.join(roomId);

    // create room
    if (!rooms[roomId]) rooms[roomId] = { participants: [] };

    // participants object
    const participant = {
      userId: user._id,
      socketId: socket.id,
      name: user.name,
      email: user.email,
    };

    // push user to room
    rooms[roomId].participants.push(participant);
    console.log("ROOMS:- ", JSON.stringify(rooms));

    await redisClient.sAdd(`room:${roomId}`, JSON.stringify(rooms[roomId]));

    const otherUsers = rooms[roomId].participants.filter(
      (user) => user.socketId !== socket.id,
    );
    console.log("other users in room:", otherUsers);

    socket.emit("all-users", otherUsers);

    // broadcast participant list
    io.to(roomId).emit("participants", rooms[roomId].participants);
    socket.to(roomId).emit("user-joined", participant);
  });

  socket.on("typing", ({ roomId, user }) => {
    socket.to(roomId).emit("show-typing", {
      userId: user._id,
      name: user.name,
    });
  });

  socket.on("stop-typing", ({ roomId, userId }) => {
    socket.to(roomId).emit("hide-typing", {
      userId,
    });
  });

  socket.on("offer", (payload) => {
    io.to(payload.target).emit("offer", {
      sdp: payload.sdp,
      caller: {
        userId: payload.userId,
        socketId: socket.id,
        name: payload.name,
        email: payload.email,
      },
    });
  });

  socket.on("join-board", (meetingId) => {
    console.log("Joining board for meeting:", meetingId);
    socket.join(meetingId);
  });

  socket.on("task-updated", (data) => {
    io.to(data.meetingId).emit("task-updated", data);
  });

  socket.on("answer", (payload) => {
    io.to(payload.target).emit("answer", {
      sdp: payload.sdp,
      caller: {
        userId: payload.userId,
        socketId: socket.id,
        name: payload.name,
        email: payload.email,
      },
    });
  });

  socket.on("ice-candidate", (payload) => {
    io.to(payload.target).emit("ice-candidate", {
      candidate: payload.candidate,
      from: {
        userId: payload.userId,
        socketId: socket.id,
        name: payload.name,
        email: payload.email,
      },
    });
  });

  socket.on("send-message", async ({ sender, roomId, message, date }) => {
    await redisClient.lPush("messages", JSON.stringify({ sender, message }));
    await redisClient.lTrim("messages", 0, 99); // Keep only the latest 100 messages
    io.to(roomId).emit("receive-message", {
      sender,
      message,
      date,
    });
  });

  socket.on("get-participants", (roomId) => {
    if (rooms[roomId]) {
      socket.emit("participants", rooms[roomId].participants);
    }
  });

  socket.on("disconnect", async () => {
    console.log("Disconnected:", socket.id);

    for (const roomId in rooms) {
      const room = rooms[roomId];

      room.participants = room.participants.filter(
        (u) => u.socketId !== socket.id,
      );

      await redisClient.sRem(`room:${roomId}`, JSON.stringify(rooms[roomId]));

      socket.to(roomId).emit("user-left", socket.id);

      io.to(roomId).emit("participants", room.participants);

      // remove room if empty
      if (room.participants.length === 0) {
        delete rooms[roomId];
      }
    }
  });
});

export { app, io, server };
