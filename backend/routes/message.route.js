import express from "express";
import { getMessage, sendMessage } from "../controller/message.controller.js";

const router = express.Router();

router.post("/send/:id", sendMessage);
router.get("/get/:id", getMessage);

export default router;
