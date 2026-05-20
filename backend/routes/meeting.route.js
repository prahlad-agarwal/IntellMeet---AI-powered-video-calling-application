import express from "express";
import {
  createMeeting,
  getAllMeeting,
  getMeetingById,
  updateMeeting,
  deleteMeeting,
  uploadRecording,
} from "../controller/meeting.controller.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.post("/createmeeting", createMeeting);
router.get("/allmeetings", getAllMeeting);
router.get("/:id", getMeetingById);
router.put("/:id", updateMeeting);
router.delete("/:id", deleteMeeting);
router.post("/upload-recording", upload.single("recording"), uploadRecording);

export default router;
