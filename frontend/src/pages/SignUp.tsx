import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdEye } from "react-icons/io";
import { IoEyeOff } from "react-icons/io5";
import { toast } from "react-toastify";
import { useUserStore } from "@/store/userStore";
import { useMutation } from "@tanstack/react-query";
import { signupUser } from "@/api/authApi";

export function SignUp() {
  const [eye, setEye] = useState<Boolean>(false);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const setUserData = useUserStore((state) => state.setUserData);
  const navigate = useNavigate();

  const signupMutation = useMutation({
    mutationFn: signupUser,

    onSuccess: (data) => {
      setUserData(data);
      localStorage.setItem("signup userData", JSON.stringify(data));
      navigate("/dashboard");
      toast.success("Signup successful");
    },
    onError: () => {
      toast.error("Invalid credentials.");
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      signupMutation.mutate({
        name,
        email,
        password,
        role,
      });
    } catch (error) {
      console.log("error in signup:- ", error);
    }
  };

  return (
    <div className="h-screen w-screen flex justify-center items-center">
      <div className="" id="createMeetingModal">
        <form onSubmit={handleSubmit}>
          <div className="modal">
            <div className="modal-title">
              Signup to your account
              <button
                className="modal-close"
                onClick={() => navigate("/dashboard")}
              >
                ✕
              </button>
            </div>
            <div className="form-group">
              <div className="flex justify-between">
                <label className="form-label">Full Name</label>
                <span
                  className="inline-block text-sm underline-offset-4 hover:underline cursor-pointer"
                  onClick={() => navigate("/login")}
                >
                  Login
                </span>
              </div>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
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
              <label className="form-label">Password</label>

              <Input
                id="password"
                type={eye ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {!eye ? (
                <IoMdEye
                  className="w-5.5 h-5.5 absolute right-[3%] bottom-1.5 cursor-pointer"
                  onClick={() => {
                    setEye(!eye);
                  }}
                />
              ) : (
                <IoEyeOff
                  className="w-5.5 h-5.5 absolute right-[3%] bottom-1.5 cursor-pointerr"
                  onClick={() => {
                    setEye(!eye);
                  }}
                />
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Select your role</label>
              <select
                className="form-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option>Select your role</option>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="modal-actions mb-4">
              <button
                className="btn btn-ghost"
                disabled={signupMutation.isPending}
              >
                {signupMutation.isPending ? "Signing up..." : "Signup"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
