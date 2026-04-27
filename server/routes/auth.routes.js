import express from "express";
import rateLimit from "express-rate-limit";
import {
  register,
  verifyOTP,
  login,
  logout,
  getUser,
  forgotPassword,
  validateResetToken,
  resetPassword,
  updatePassword,
  updateProfile,
  resendOTP,
} from "../controllers/auth.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, 
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, 
  message: {
    success: false,
    message: "Too many login attempts, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public Routes
router.post("/register", authLimiter, register);
router.post("/verify-otp", authLimiter, verifyOTP);
router.post("/resend-otp", authLimiter, resendOTP);
router.post("/login", loginLimiter, login);
router.post("/password/forgot", authLimiter, forgotPassword);
router.get("/password/validate/:token", authLimiter, validateResetToken);
router.put("/password/reset/:token", authLimiter, resetPassword);

// Protected routes (authenticated users only)
router.post("/logout", isAuthenticated, logout);
router.get("/me", isAuthenticated, getUser);
router.put("/profile/update", isAuthenticated, updateProfile);
router.put("/password/update", isAuthenticated, updatePassword);

export default router;
