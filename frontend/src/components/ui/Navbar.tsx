import "../../styles/Navbar.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { useUserStore } from "@/store/userStore";

const Navbar = () => {
  const navigate = useNavigate();
  const serverUrl = useAuthStore((state) => state.serverUrl);
  const userData = useUserStore((state) => state.userData);
  const setUserData = useUserStore((state) => state.setUserData);

  const handleLogout = async () => {
    try {
      let res = await axios.post(serverUrl + "/api/user/logout", {
        withCredentials: true,
      });
      setUserData(null);
      console.log(res.data);
    } catch (error) {
      console.log("Error in handleLogout:- ", error);
    }
  };

  return (
    <>
      <div className="topbar h-15 z-100">
        <span
          className={`logo cursor-pointer ${window.innerWidth < 768 ? "ml-40" : ""}`}
          onClick={() => {
            navigate("/dashboard");
          }}
        >
          IntellMeet
        </span>
        {userData?.role == "admin" ? (
          <div className="topbar-tabs" id="topTabs">
            <button className="ttab active">Admin View</button>
          </div>
        ) : (
          <div className="topbar-tabs" id="topTabs">
            <button className="ttab active">Member View</button>
          </div>
        )}

        {userData != null ? (
          <div className="flex items-center gap-4">
            <span className="role-badge role-admin" id="roleBadge">
              {userData?.role}
            </span>
            <div
              className="avatar"
              style={{
                backgroundColor: "rgba(124, 92, 252, 0.2)",
                color: "#a78bfa",
                cursor: "pointer",
              }}
              onClick={() => navigate("/profile")}
            >
              {userData?.profilePic != "" ? (
                <img
                  className="size-8 rounded-full object-cover cursor-pointer"
                  src={userData?.profilePic}
                />
              ) : (
                userData?.name.charAt(0).toUpperCase()
              )}
            </div>
            <div
              className="bg-red-500 role-badge cursor-pointer"
              onClick={() => {
                handleLogout();
                navigate("/dashboard");
              }}
            >
              Logout
            </div>
          </div>
        ) : (
          <div
            className="role-badge role-admin cursor-pointer"
            onClick={() => navigate("/signup")}
          >
            Signup
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;
