import express from "express";
import {
  getAdminDashboard,
  getTeacherDashboard,
  getStudentDashboard,
  getSystemStats,
} from "../controllers/dashboard.controller.js";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

// Role-specific dashboards
router.get("/admin", isAuthorized("Admin"), getAdminDashboard);
router.get("/teacher", isAuthorized("Teacher"), getTeacherDashboard);
router.get("/student", isAuthorized("Student"), getStudentDashboard);

// System statistics (Admin only)
router.get("/stats", isAuthorized("Admin"), getSystemStats);

export default router;
