import express from "express";
import {
  createRecommendation,
  getFreePeriodRecommendations,
  getUserRecommendations,
  getRecommendationById,
  updateRecommendationStatus,
  deleteRecommendation,
  getRecommendationStats,
  bulkCreateRecommendations,
  getCourseRecommendations,
} from "../controllers/recommendation.controller.js";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

// Admin and Teacher routes
router.post("/", isAuthorized("Admin", "Teacher"), createRecommendation);
router.post("/bulk", isAuthorized("Admin", "Teacher"), bulkCreateRecommendations);
router.delete("/:id", isAuthorized("Admin", "Teacher"), deleteRecommendation);

// Student routes
router.get("/free-period", getFreePeriodRecommendations);
router.get("/courses", getCourseRecommendations);
router.patch("/:id/status", updateRecommendationStatus);

// All authenticated users
router.get("/user/:userId", getUserRecommendations);
router.get("/user/:userId/stats", getRecommendationStats);
router.get("/:id", getRecommendationById);

export default router;
