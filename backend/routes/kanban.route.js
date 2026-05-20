import express from "express";
import { getBoard, updateBoard } from "../controller/kanban.controller.js";

const router = express.Router();

router.get("/:meetingId", getBoard);
router.put("/task/:taskId", updateBoard);

export default router;
