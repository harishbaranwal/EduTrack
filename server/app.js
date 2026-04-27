import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"

import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import batchRouter from "./routes/batch.routes.js";
import attendanceRouter from "./routes/attendance.routes.js";
import timetableRouter from "./routes/timetable.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import recommendationRouter from "./routes/recommendation.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import contactRouter from "./routes/contact.routes.js";
import chatbotRouter from "./routes/chatbot.routes.js";

export const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}))

const corsOptions = {
  origin: function (origin, callback) {
    const envOrigins = (process.env.CLIENT_URL || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const allowedOrigins = [
      ...envOrigins,
      "http://localhost:5173",
      "http://localhost:5174",
    ];

    const isLocalhostDevOrigin = /^http:\/\/localhost:\d+$/.test(origin || "");

    if (!origin || allowedOrigins.includes(origin) || isLocalhostDevOrigin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/batches", batchRouter);
app.use("/api/v1/attendance", attendanceRouter);
app.use("/api/v1/timetable", timetableRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/recommendations", recommendationRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/contact", contactRouter);
app.use("/api/v1/chatbot", chatbotRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});