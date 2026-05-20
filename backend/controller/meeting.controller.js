import express from "express";
import streamifier from "streamifier";
import Meeting from "../models/meeting.model.js";

export const createMeeting = async (req, res) => {
  try {
    const { title, host, date, meetingId } = req.body;
    const meeting = await Meeting.create({
      title,
      host,
      meetingId,
    });
    return res.status(201).json(meeting);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getAllMeeting = async (req, res) => {
  try {
    const meetings = await Meeting.find().populate("host");
    return res.status(200).json(meetings);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMeetingById = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    return res.status(200).json(meeting);
  } catch (error) {
    return res.status(404).json({ message: "Meeting not found" });
  }
};

export const updateMeeting = async (req, res) => {
  try {
    const { title, date, time } = req.body;
    const meeting = await Meeting.findByIdAndUpdate(
      req.params.id,
      { title, date, time },
      { new: true },
    );
    return res.status(200).json(meeting);
  } catch (error) {
    return res.status(404).json({ message: "Meeting not found" });
  }
};

export const deleteMeeting = async (req, res) => {
  try {
    await Meeting.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Meeting deleted successfully" });
  } catch (error) {
    return res.status(404).json({ message: "Meeting not found" });
  }
};

export const uploadRecording = async (req, res) => {
  try {
    const { meetingId } = req.body;
    console.log(meetingId);
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    console.log("file backend:- ", req.file);

    // create video url
    const videoUrl = `${req.protocol}://${req.get("host")}/public/${req.file.filename}`;

    const recording = await Meeting.findOneAndUpdate(
      { meetingId: meetingId },
      { recordingUrl: videoUrl },
      { new: true },
    );
    if (!recording) {
      return res
        .status(400)
        .json({ success: false, message: "Meeting not found" });
    }
    return res.status(201).json({
      success: true,
      message: "Recording uploaded successfully",
      recording,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
