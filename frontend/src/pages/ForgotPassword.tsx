import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { IoMdEye } from "react-icons/io";
import { IoEyeOff } from "react-icons/io5";
import { toast } from "react-toastify";
import { useAuthStore } from "@/store/authStore";
import { useUserStore } from "@/store/userStore";

export function ForgotPassword() {
  const [pEye, setPEye] = useState<Boolean>(false);
  const [cPEye, setCPEye] = useState<Boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const serverUrl = useAuthStore((state) => state.serverUrl);
  const setUserData = useUserStore((state) => state.setUserData);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      if (password !== confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }
      let res = await axios.put(
        serverUrl + "/api/user/forgot-password",
        {
          email,
          password,
        },
        { withCredentials: true },
      );
      setUserData(res.data);
      navigate("/login");
      toast.success("Password updated successfully.");
      console.log("forgot password successfull", res.data);
    } catch (error) {
      toast.error("Error updating password.");
      console.log("error in forgot password:- ", error);
    }
  };

  return (
    <div className="h-screen w-screen flex justify-center items-center">
      <div className="" id="createMeetingModal">
        <form onSubmit={handleSubmit}>
          <div className="modal">
            <div className="modal-title">
              Forgot Password
              <button
                className="modal-close"
                onClick={() => navigate("/login")}
              >
                ✕
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>

              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group relative">
              <label className="form-label">New Password</label>

              <Input
                id="password"
                type={pEye ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {!pEye ? (
                <IoMdEye
                  className="w-5.5 h-5.5 absolute right-[3%] bottom-1.5 cursor-pointer"
                  onClick={() => {
                    setPEye(!pEye);
                  }}
                />
              ) : (
                <IoEyeOff
                  className="w-5.5 h-5.5 absolute right-[3%] bottom-1.5 cursor-pointerr"
                  onClick={() => {
                    setPEye(!pEye);
                  }}
                />
              )}
            </div>

            <div className="form-group relative">
              <label className="form-label">Confirm New Password</label>

              <Input
                id="password"
                type={cPEye ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {!cPEye ? (
                <IoMdEye
                  className="w-5.5 h-5.5 absolute right-[3%] bottom-1.5 cursor-pointer"
                  onClick={() => {
                    setCPEye(!cPEye);
                  }}
                />
              ) : (
                <IoEyeOff
                  className="w-5.5 h-5.5 absolute right-[3%] bottom-1.5 cursor-pointerr"
                  onClick={() => {
                    setCPEye(!cPEye);
                  }}
                />
              )}
            </div>

            <div className="modal-actions mb-4">
              <button className="btn btn-ghost">Change Password</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
