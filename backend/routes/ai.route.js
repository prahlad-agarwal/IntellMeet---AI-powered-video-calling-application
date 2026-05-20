import express from "express";
import processMeeting from "../controller/ai.controller.js";

const router = express.Router();

router.post(`/process/:meetingId`, processMeeting);

export default router;
