import axios from "axios";
import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { useParams } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

const statuses = ["todo", "inprogress", "done"];

interface Task {
  _id: string;
  title: string;
  status: string;
}

interface Board {
  tasks: Task[];
}

const KanbanBoard = () => {
  const { meetingId } = useParams();
  console.log(meetingId);
  const [board, setBoard] = useState<Board | null>(null);
  const serverUrl = useAuthStore((state) => state.serverUrl);

  useEffect(() => {
    fetchBoard();
  }, []);

  const fetchBoard = async () => {
    try {
      const response = await axios.get(serverUrl + `/api/kanban/${meetingId}`);
      setBoard(response.data);
    } catch (error) {
      console.error("Error fetching kanban board:", error);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId;

    try {
      await axios.put(serverUrl + `/api/kanban/task/${taskId}`, {
        status: newStatus,
      });
      fetchBoard();

      if (!board) return <div>Loading...</div>;
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{ display: "flex", gap: "20px" }}>
        {statuses.map((status) => (
          <Droppable droppableId={status} key={status}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  width: "300px",
                  minHeight: "500px",
                  background: "#eee",
                  padding: "10px",
                  color: "green",
                  fontWeight: "bold",
                }}
              >
                <h2>{status}</h2>
                {board &&
                  board.tasks
                    .filter((task) => task.status === status)
                    .map((task: Task, index: number) => (
                      <Draggable
                        key={task._id}
                        draggableId={task._id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              background: "white",
                              backgroundColor: snapshot.isDragging
                                ? "lightblue"
                                : "white",
                              border: "1px solid #ccc",
                              marginBottom: "10px",
                              padding: "10px",
                              color: "#000",
                            }}
                          >
                            <h4>{task.title}</h4>
                          </div>
                        )}
                      </Draggable>
                    ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
