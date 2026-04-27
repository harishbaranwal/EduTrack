import express from "express";
import {
  createBatch,
  getAllBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
  addStudentsToBatch,
  removeStudentFromBatch,
  getStudentsByBatch,
  getTeacherBatches,
} from "../controllers/batch.controller.js";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

// Admin only routes
router.post("/", isAuthorized("Admin"), createBatch);
router.put("/:id", isAuthorized("Admin"), updateBatch);
router.delete("/:id", isAuthorized("Admin"), deleteBatch);
router.post("/:id/students", isAuthorized("Admin"), addStudentsToBatch);
router.delete("/:id/students/:studentId", isAuthorized("Admin"), removeStudentFromBatch);

// Teacher routes
router.get("/teacher-batches", isAuthorized("Teacher", "Admin"), getTeacherBatches);

// Admin and Teacher routes
router.get("/", isAuthorized("Admin", "Teacher"), getAllBatches);
router.get("/:id", isAuthorized("Admin", "Teacher"), getBatchById);
router.get("/:id/students", isAuthorized("Admin", "Teacher"), getStudentsByBatch);

export default router;
