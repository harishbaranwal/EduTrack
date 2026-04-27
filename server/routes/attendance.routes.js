import express from "express";
import {
  markAttendanceByQR,
  markAttendanceByLocation,
  getStudentAttendance,
  getClassAttendance,
  generateQRData,
  markManualAttendance,
  markBulkManualAttendance,
  getAttendanceHistory,
  getTodayClasses,
} from "../controllers/attendance.controller.js";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

// Student routes
router.post("/qr", isAuthorized("Student"), markAttendanceByQR);
router.post("/location", isAuthorized("Student"), markAttendanceByLocation);
router.get("/student/my-attendance", isAuthorized("Student"), getStudentAttendance);
router.get("/student/today-classes", isAuthorized("Student"), getTodayClasses);

// Teacher routes
router.post("/qr/generate", isAuthorized("Teacher"), generateQRData);
router.get("/class", isAuthorized("Teacher", "Admin"), getClassAttendance);

// Manual attendance routes (Admin/Teacher)
router.post("/manual", isAuthorized("Admin", "Teacher"), markManualAttendance);
router.post("/manual/bulk", isAuthorized("Admin", "Teacher"), markBulkManualAttendance);

// Attendance history and tracking (Admin/Teacher)
router.get("/history", isAuthorized("Admin", "Teacher"), getAttendanceHistory);

export default router;
