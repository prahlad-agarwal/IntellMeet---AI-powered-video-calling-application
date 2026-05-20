import { useState, type ChangeEvent } from "react";
import { IoCamera } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";
import { toast } from "react-toastify";
import { useUserStore } from "@/store/userStore";
import { useMutation } from "@tanstack/react-query";
import { profileUser } from "@/api/authApi";

const Profile = () => {
  const [preview, setPreview] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const userData = useUserStore((state) => state.userData);

  const profileMutation = useMutation({
    mutationFn: profileUser,

    onSuccess: (data) => {
      console.log(data);
      toast.success("Profile updated successfully");
    },
    onError: () => {
      toast.error("Error updating profile.");
    },
  });

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));

    try {
      const formData = new FormData();
      formData.append("profilePic", file);

      profileMutation.mutate({
        formData,
      });
    } catch (error) {
      console.log("profile submit error:- ", error);
    }
  };

  return (
    <div className="h-screen pt-10 border-2 mx-auto rounded-xl flex justify-center items-center">
      <div className="max-w-2xl mx-auto p-4 py-10 border-2 rounded-xl flex justify-center items-center">
        <div className="bg-base-200 rounded-xl p-2 space-y-5">
          <div className="text-center">
            <h1 className="text-2xl font-semibold ">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* avatar upload section */}

          <div className="flex flex-col items-center gap-1">
            <div className="relative">
              <img
                src={
                  preview ||
                  userData?.profilePic ||
                  userData?.name.charAt(0).toUpperCase()
                }
                alt=""
                className="size-28 rounded-full object-cover border-4"
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer
                  transition-all duration-200
                  ${profileMutation.isPending ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <IoCamera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {preview
                ? "Uploading..."
                : "Click the camera icon to update your photo"}
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <FaUser className="w-4 h-4" />
                Full Name
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                {userData?.name}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <IoMdMail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                {userData?.email}
              </p>
            </div>
          </div>

          <div className="mt-0 bg-base-200 rounded-xl p-6">
            <h2 className="text-lg font-medium text-white mb-4">
              Account Information
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-1 border-b border-zinc-700">
                <span className="text-white">Member Since</span>
                <span>{userData?.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-white">Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
