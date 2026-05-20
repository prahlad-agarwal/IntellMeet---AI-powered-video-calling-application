import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    meetingId: {
      type: String,
      required: true,
    },
    host: {
      type: String,
      required: true,
    },
    recordingUrl: {
      type: String,
    },

    transcript: {
      type: String,
    },
    summary: {
      type: String,
    },
    actionItems: [
      {
        text: String,
        assignee: {
          type: String,
        },
        status: {
          type: String,
          default: "todo",
        },
      },
    ],
  },
  { timestamps: true },
);

const Meeting = mongoose.model("Meeting", meetingSchema);

export default Meeting;
