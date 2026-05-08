import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

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

/* ================= CORS FIRST ================= */
<<<<<<< HEAD

const corsOptions = {
  // Reflect request origin so credentials/cookies can still be used across origins.
  origin: true,
  credentials: true,
=======

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://edutrack-hln.vercel.app"
];

const corsOptions = {
  origin: function (origin, callback) {

    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },

  credentials: true
>>>>>>> 3279b76c5c3c13483473fd7aa54359c249daaaed
};

app.use(cors(corsOptions));

<<<<<<< HEAD

=======
>>>>>>> 3279b76c5c3c13483473fd7aa54359c249daaaed
/* ================= OTHER MIDDLEWARE ================= */

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= ROUTES ================= */

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

/* ================= 404 ================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* ================= ERROR HANDLER ================= */

app.use((err, req, res, next) => {
  console.error("Error:", err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});
