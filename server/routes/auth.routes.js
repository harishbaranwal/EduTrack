import express from "express";
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
  devLogin,
} from "../controllers/auth.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public Routes
router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", login);
router.post("/dev-login", devLogin); // DEV ONLY: Quick login by email (no password needed)
router.post("/password/forgot", forgotPassword);
router.get("/password/validate/:token", validateResetToken);
router.put("/password/reset/:token", resetPassword);

// Protected routes (authenticated users only)
router.post("/logout", isAuthenticated, logout);
router.get("/me", isAuthenticated, getUser);
router.put("/profile/update", isAuthenticated, updateProfile);
router.put("/password/update", isAuthenticated, updatePassword);

export default router;
