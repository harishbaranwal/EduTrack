import express from "express";
import {
  getAllUsers,
  getUserById,
  updateProfile,
  updateUser,
  deleteUser,
  getStudentsByBatch,
  getAllTeachers,
  getUserStats,
  searchUsers,
  getUsersByRole,
} from "../controllers/user.controller.js";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(isAuthenticated);

router.put("/profile", updateProfile);

// Admin only routes
router.get("/", isAuthorized("Admin"), getAllUsers);
router.get("/stats", isAuthorized("Admin"), getUserStats);
router.get("/role/:role", isAuthorized("Admin"), getUsersByRole);
router.put("/:id", isAuthorized("Admin"), updateUser);
router.delete("/:id", isAuthorized("Admin"), deleteUser);

// Admin and Teacher routes
router.get("/search", isAuthorized("Admin", "Teacher"), searchUsers);
router.get("/teachers", isAuthorized("Admin", "Teacher"), getAllTeachers);
router.get("/batch/:batchId/students", isAuthorized("Admin", "Teacher"), getStudentsByBatch);

// All authenticated users
router.get("/:id", getUserById);

export default router;
