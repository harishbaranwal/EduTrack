import * as dashboardService from "../services/dashboard.service.js";

// Get admin dashboard statistics

export const getAdminDashboard = async (req, res) => {
  try {
    const stats = await dashboardService.getAdminDashboardStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch admin dashboard",
    });
  }
};

// Get teacher dashboard statistics

export const getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user.id || req.user._id;

    const stats = await dashboardService.getTeacherDashboardStats(teacherId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch teacher dashboard",
    });
  }
};

// Get student dashboard statistics

export const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user.id || req.user._id;

    const stats = await dashboardService.getStudentDashboardStats(studentId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch student dashboard",
    });
  }
};

// Get system-wide statistics

export const getSystemStats = async (req, res) => {
  try {
    const stats = await dashboardService.getSystemStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch system statistics",
    });
  }
};

// Get batch-specific dashboard statistics

export const getBatchDashboard = async (req, res) => {
  try {
    const { batchId } = req.params;

    const stats = await dashboardService.getBatchDashboardStats(batchId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch batch dashboard",
    });
  }
};
