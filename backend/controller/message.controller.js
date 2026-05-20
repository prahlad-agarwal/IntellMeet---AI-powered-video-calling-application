import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socketIO/server.js";

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const senderId = req.userId; // current loggedIn user

    const newMessage = Message.create({
      senderId,
      message,
    });

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(200).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller :- ", error);
    res.status(500).json({ error: "Internal Server error" });
  }
};

export const getMessage = async (req, res) => {
  try {
    const { id: chatUser } = req.params;
    const senderId = req.userId; // current loggedIn user
    const messages = Message.find();
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessage :- ", error);
    res.status(500).json({ error: "Internal Server error" });
  }
};
