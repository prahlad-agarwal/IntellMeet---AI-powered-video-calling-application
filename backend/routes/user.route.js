import express from "express";
import {
  signup,
  login,
  profile,
  getCurrentUser,
  logout,
  changePassword,
  googleLogin,
} from "../controller/user.controller.js";
import isAuth from "../middleware/isAuth.js";
import upload from "../middleware/multer.js";
import authLimiter from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);
router.post("/google-login", authLimiter, googleLogin);
router.put("/forgot-password", authLimiter, changePassword);
router.post("/logout", authLimiter, logout);

router.get("/getcurrentuser", isAuth, getCurrentUser);

router.post(
  "/profile-update",
  isAuth,
  upload.fields([{ name: "profilePic", maxCount: 1 }]),
  profile,
);

export default router;
