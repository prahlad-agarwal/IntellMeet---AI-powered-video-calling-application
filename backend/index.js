import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import { RedisStore } from "connect-redis";
dotenv.config();

import { app, server } from "./socketIO/server.js";

import dbConnect from "./config/db.js";
import { connectRedis, redisClient } from "./config/redis.js";
import userRoute from "./routes/user.route.js";
import meetingRoute from "./routes/meeting.route.js";
import aiRoute from "./routes/ai.route.js";
import kanbanRoute from "./routes/kanban.route.js";
import session from "express-session";

app.use(express.json());
app.use(helmet());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use((req, res, next) => {
  res.header("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});
app.use("/public", express.static(path.join(process.cwd(), "public")));
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    cookie: {
      secure: false, // Set to true if using HTTPS
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  }),
);

dbConnect();
app.use("/api/user", userRoute);
app.use("/api/meeting", meetingRoute);
app.use("/api/ai", aiRoute);
app.use("/api/kanban", kanbanRoute);

const startServer = async () => {
  try {
    // connect redis first
    await connectRedis();

    // then start server
    server.listen(process.env.SERVER_PORT, () => {
      console.log(`server is listening on port ${process.env.SERVER_PORT}`);
    });
  } catch (error) {
    console.log("Server startup failed", error);
  }
};

startServer();
