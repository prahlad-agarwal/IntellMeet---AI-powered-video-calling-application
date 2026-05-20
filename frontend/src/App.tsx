import { Navigate, Route, Routes } from "react-router-dom";
import { Login } from "./pages/Login.tsx";
import { SignUp } from "./pages/SignUp.tsx";
import Profile from "./pages/Profile.tsx";
import Navbar from "./components/ui/Navbar.tsx";
import Meetings from "./pages/Meetings.tsx";
import Lobby from "./pages/Lobby.tsx";
import Room from "./pages/Room.tsx";
import Recordings from "./pages/Recordings.tsx";
import Sidebar from "./components/ui/Sidebar.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import CreateMeeting from "./pages/CreateMeeting.tsx";
import KanbanBoard from "./pages/KanbanBoard.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import { useUserStore } from "./store/userStore.ts";
import { useEffect } from "react";

function App() {
  const userData = useUserStore((state) => state.userData);
  const getCurrentUser = useUserStore((state) => state.getCurrentUser);

  useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);

  return (
    <>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <div className="flex h-screen">
                <Sidebar />
                <Dashboard />
              </div>
            }
          ></Route>

          <Route
            path="/meetings"
            element={
              userData != null ? (
                <div className="flex h-screen">
                  <Sidebar />
                  <Meetings />
                </div>
              ) : (
                <Login />
              )
            }
          ></Route>

          <Route
            path="/lobby"
            element={
              userData != null ? (
                <div className="flex h-screen">
                  <Sidebar />
                  <Lobby />
                </div>
              ) : (
                <Login />
              )
            }
          ></Route>

          <Route
            path="/room"
            element={
              userData != null ? (
                <div className="flex h-screen">
                  <Sidebar />
                  <Room />
                </div>
              ) : (
                <Login />
              )
            }
          ></Route>

          <Route
            path="/recordings"
            element={
              userData != null ? (
                <div className="flex h-screen">
                  <Sidebar />
                  <Recordings />
                </div>
              ) : (
                <Login />
              )
            }
          ></Route>

          <Route
            path="/kanban/:meetingId"
            element={
              userData != null ? (
                <div className="flex h-screen">
                  <Sidebar />
                  <KanbanBoard />
                </div>
              ) : (
                <Login />
              )
            }
          ></Route>

          <Route
            path="/createmeeting"
            element={
              userData != null ? (
                <div className="flex h-screen">
                  <Sidebar />
                  <CreateMeeting />
                </div>
              ) : (
                <Login />
              )
            }
          ></Route>

          <Route
            path="/profile"
            element={userData != null ? <Profile /> : <Login />}
          ></Route>

          {/* </Route> */}

          <Route path="/login" element={<Login />}></Route>
          <Route path="/change-password" element={<ForgotPassword />}></Route>
          <Route path="/signup" element={<SignUp />}></Route>
        </Routes>
      </div>
    </>
  );
}

export default App;
