import KanbanBoard from "../models/kanbanBoard.model.js";

export const getBoard = async (req, res) => {
  try {
    const board = await KanbanBoard.findOne({
      meetingId: req.params.meetingId,
    });
    return res.json(board);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const updateBoard = async (req, res) => {
  try {
    const board = await KanbanBoard.findOne({
      "tasks._id": req.params.taskId,
    });
    const task = board.tasks.id(req.params.taskId);
    task.status = req.body.status;
    await board.save();
    return res.json(board);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};
