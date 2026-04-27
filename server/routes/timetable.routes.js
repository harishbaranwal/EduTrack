import express from "express";
import {
  createTimetable,
  getAllTimetables,
  getTimetableById,
  getWeeklyTimetable,
  getTeacherTimetable,
  updateTimetable,
  deleteTimetable,
  getFreePeriods,
  getTeacherCurrentClass,
  getTeacherTodaySchedule,
  getBatchSubjects,
} from "../controllers/timetable.controller.js";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

// Admin only routes
router.post("/", isAuthorized("Admin"), createTimetable);
router.put("/:id", isAuthorized("Admin"), updateTimetable);
router.delete("/:id", isAuthorized("Admin"), deleteTimetable);

// Teacher specific routes
router.get("/teacher/current-class", isAuthorized("Teacher"), getTeacherCurrentClass);
router.get("/teacher/today", isAuthorized("Teacher"), getTeacherTodaySchedule);
router.get("/teacher/weekly", isAuthorized("Teacher"), getTeacherTimetable);

// Batch specific routes
router.get("/batch/:batchId/subjects", isAuthorized("Admin", "Teacher"), getBatchSubjects);

// All authenticated users can view timetables
router.get("/", getAllTimetables);
router.get("/free-periods", getFreePeriods);
router.get("/:id", getTimetableById);
router.get("/batch/:batchId/weekly", getWeeklyTimetable);
router.get("/teacher/:teacherId/weekly", getTeacherTimetable);

export default router;
