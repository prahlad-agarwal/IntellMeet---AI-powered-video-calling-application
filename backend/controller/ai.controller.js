import Meeting from "../models/meeting.model.js";
import fs from "fs";
import path from "path";
import axios from "axios";
import convertVideoToAudio from "../services/videoToAudio.js";
import {
  generateSummaryAndTasks,
  transcribeAudio,
} from "../services/ai.services.js";
import KanbanBoard from "../models/kanbanBoard.model.js";
import Notification from "../models/notification.model.js";

import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const processMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const recording = await Meeting.findOne({
      meetingId: meetingId,
    });

    if (!recording) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    const videoPath = path.join(__dirname, "../public/video.webm");
    const audioPath = path.join(__dirname, "../public/audio.mp3");

    console.log(recording.recordingUrl);

    // download video
    const response = await axios({
      url: `${recording.recordingUrl}`,
      method: "GET",
      responseType: "stream",
    });
    const writer = fs.createWriteStream(videoPath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    await convertVideoToAudio(videoPath, audioPath);

    const transcript = await transcribeAudio(audioPath);

    const aiData = await generateSummaryAndTasks(transcript);

    recording.transcript = transcript;
    recording.summary = aiData.summary;
    recording.actionItems = aiData.tasks;

    await recording.save();

    const board = await KanbanBoard.create({
      meetingId: recording.meetingId,
      tasks: aiData.tasks.map((task) => ({
        title: task.title,
        status: "todo",
      })),
    });

    for (const task of aiData.tasks) {
      if (task.assignee) {
        await Notification.create({
          user: task.assignee,
          text: `New task assigned: ${task.title}`,
        });
      }
    }

    return res.json({ success: true, board });
  } catch (error) {
    console.log("process meeting ai error:- ", error);
    return res.status(500).json({ message: error.message });
  }
};

export default processMeeting;
