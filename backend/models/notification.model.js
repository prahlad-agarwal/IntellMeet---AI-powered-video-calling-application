import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: String,
    },
    text: String,
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
