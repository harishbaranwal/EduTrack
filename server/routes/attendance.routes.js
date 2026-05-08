import express from "express";
import {
  markAttendanceByQR,
  verifyStudentLocation,
  getStudentAttendance,
  getClassAttendance,
  generateQRData,
  markManualAttendance,
  markBulkManualAttendance,
  getAttendanceHistory,
  getTodayClasses,
  updateTeacherLocation,
  stopTeacherLocation,
  getTeacherLocationStatus,
} from "../controllers/attendance.controller.js";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

// Student routes
router.post("/qr", isAuthorized("Student"), markAttendanceByQR);
router.post("/verify-location", isAuthorized("Student"), verifyStudentLocation);
router.get("/student/my-attendance", isAuthorized("Student"), getStudentAttendance);
router.get("/student/today-classes", isAuthorized("Student"), getTodayClasses);

// Teacher routes
router.post("/qr/generate", isAuthorized("Teacher"), generateQRData);
router.post("/teacher/location", isAuthorized("Teacher"), updateTeacherLocation);
router.post("/teacher/location/stop", isAuthorized("Teacher"), stopTeacherLocation);
router.get("/teacher/location/:teacherId", getTeacherLocationStatus);
router.get("/class", isAuthorized("Teacher", "Admin"), getClassAttendance);

// Manual attendance routes (Admin/Teacher)
router.post("/manual", isAuthorized("Admin", "Teacher"), markManualAttendance);
router.post("/manual/bulk", isAuthorized("Admin", "Teacher"), markBulkManualAttendance);

// Attendance history and tracking (Admin/Teacher)
router.get("/history", isAuthorized("Admin", "Teacher"), getAttendanceHistory);

export default router;
