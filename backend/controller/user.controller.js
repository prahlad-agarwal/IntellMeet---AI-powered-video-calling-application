import uploadCloudinary from "../config/cloudinary.js";
import getToken from "../jwt/token.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({ message: "User already exist" });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashPassword,
      role,
    });
    getToken(user._id, res);
    req.session.user = {
      email: user.email,
      id: user._id,
    };
    return res.status(201).json(user);
  } catch (error) {
    console.log("Error in user controller:- ", error);
    return res.status(500).json({ message: "Internal Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!user || !isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    getToken(user._id, res);
    req.session.user = {
      email: user.email,
      id: user._id,
    };
    return res.status(201).json(user);
  } catch (error) {
    console.log("Error in user controller:- ", error);
    return res.status(500).json({ message: "Internal Server error" });
  }
};

export const profile = async (req, res) => {
  try {
    const profilePic = await uploadCloudinary(req.files.profilePic[0].path);
    const userId = req.userId;
    const user = await User.findByIdAndUpdate(
      userId,
      {
        profilePic: profilePic,
      },
      { new: true },
    );
    return res.status(201).json(user);
  } catch (error) {
    console.log("Error in user controller:- ", error);
    return res.status(500).json({ message: "Internal Server error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(201).json({ message: "User logged out successfully" });
  } catch (error) {
    console.log("Error :", error.message);
    return res.status(500).json({ message: "Internal Server error" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const Euser = await User.findOne({ email });
    if (!Euser) {
      return res.status(404).json({ message: "User not found" });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.findOneAndUpdate(
      { email },
      { password: hashPassword },
    );
    user.password = hashPassword;
    await user.save();
    getToken(user._id, res);
    return res.status(201).json(user);
  } catch (error) {
    console.log("Error in change password controller:- ", error);
    return res.status(500).json({ message: "Internal Server error" });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: `getCurrentUser error ${error}` });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    console.log(process.env.GOOGLE_CLIENT_ID);
    const payload = ticket.getPayload();

    const { name, email, sub } = payload;
    let user = await User.findOne({ email });

    // If user doesn't exist, create a new user with the Google ID
    if (!user) {
      user = await User.create({
        name,
        email,
        googleId: sub,
      });
    }
    getToken(user._id, res);
    req.session.user = {
      email: user.email,
      id: user._id,
    };
    return res.status(201).json(user);
  } catch (error) {
    console.log("Error in google login controller:- ", error);
    return res.status(500).json({ message: "Internal Server error" });
  }
};
