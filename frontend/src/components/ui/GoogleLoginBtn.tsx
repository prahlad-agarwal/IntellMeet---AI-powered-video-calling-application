import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/store/userStore";

const GoogleLoginBtn = () => {
  const navigate = useNavigate();
  const serverUrl = useAuthStore((state) => state.serverUrl);
  const setUserData = useUserStore((state) => state.setUserData);

  const handleSubmit = async (credentialResponse: any) => {
    try {
      const response = await axios.post(serverUrl + "/api/user/google-login", {
        token: credentialResponse.credential,
      });
      setUserData(response.data);
      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
      toast.success("Google Login Successful");
    } catch (error) {
      console.error("Error logging in with Google:", error);
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSubmit}
      onError={() => {
        toast.error("Google login failed. Please try again.");
      }}
    />
  );
};

export default GoogleLoginBtn;
