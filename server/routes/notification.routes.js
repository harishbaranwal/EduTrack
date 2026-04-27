import express from "express";
import {
  createNotificationForAll,
  createNotificationForSpecific,
  createNotificationForBatch,
  getUserNotifications,
  getAllNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats,
} from "../controllers/notification.controller.js";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

// Admin and Teacher routes - create notifications
router.post("/all", isAuthorized("Admin", "Teacher"), createNotificationForAll);
router.post("/specific", isAuthorized("Admin", "Teacher"), createNotificationForSpecific);
router.post("/batch", isAuthorized("Admin", "Teacher"), createNotificationForBatch);

// Admin only routes
router.get("/all", isAuthorized("Admin"), getAllNotifications);
router.get("/stats", isAuthorized("Admin"), getNotificationStats);
router.delete("/:id", isAuthorized("Admin"), deleteNotification);

// User routes
router.get("/", getUserNotifications);
router.get("/:id", getNotificationById);
router.patch("/:id/read", markAsRead);
router.patch("/read/all", markAllAsRead);

export default router;
