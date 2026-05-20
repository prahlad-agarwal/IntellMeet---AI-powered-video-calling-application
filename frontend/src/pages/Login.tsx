import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdEye } from "react-icons/io";
import { IoEyeOff } from "react-icons/io5";
import { toast } from "react-toastify";
import { useUserStore } from "@/store/userStore";
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "@/api/authApi";
import GoogleLoginBtn from "@/components/ui/GoogleLoginBtn";

export function Login() {
  const [eye, setEye] = useState<Boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const setUserData = useUserStore((state) => state.setUserData);
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: loginUser,

    onSuccess: (data) => {
      setUserData(data);
      localStorage.setItem("login userData", JSON.stringify(data));
      navigate("/dashboard");
      toast.success("Login successful!");
    },
    onError: () => {
      toast.error("Invalid email or password.");
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      loginMutation.mutate({
        email,
        password,
      });
    } catch (error) {
      console.log("error in login:- ", error);
    }
  };

  return (
    <div className="h-screen w-screen flex justify-center items-center">
      <div className="" id="createMeetingModal">
        <form onSubmit={handleSubmit}>
          <div className="modal">
            <div className="modal-title">
              Login to your account
              <button
                className="modal-close"
                onClick={() => navigate("/dashboard")}
              >
                ✕
              </button>
            </div>
            <div className="form-group">
              <div className="flex justify-between">
                <label className="form-label">Email</label>
                <span
                  className="inline-block text-sm underline-offset-4 hover:underline cursor-pointer"
                  onClick={() => navigate("/signup")}
                >
                  Signup
                </span>
              </div>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group relative">
              <div className="flex justify-between">
                <label className="form-label">Password</label>
                <span
                  className="inline-block text-sm underline-offset-4 hover:underline cursor-pointer"
                  onClick={() => navigate("/change-password")}
                >
                  Forgot your Password?
                </span>
              </div>
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

            <div className="modal-actions mb-4">
              <button
                className="btn btn-ghost"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Logging in..." : "Login"}
              </button>
              {/* <button className="btn btn-primary">Login with Google</button> */}
              <GoogleLoginBtn />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
