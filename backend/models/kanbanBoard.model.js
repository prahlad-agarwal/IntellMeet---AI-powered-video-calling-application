import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  status: {
    type: String,
    enum: ["todo", "inprogress", "done"],
    default: "todo",
  },
});

const kanbanBoardSchema = new mongoose.Schema(
  {
    meetingId: String,
    tasks: [taskSchema],
  },
  { timestamps: true },
);

const KanbanBoard = mongoose.model("KanbanBoard", kanbanBoardSchema);

export default KanbanBoard;
