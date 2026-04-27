import * as userService from "../services/user.service.js";

// Get all users (Admin only)

export const getAllUsers = async (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      role: req.query.role,
      batch: req.query.batch,
    };

    const users = await userService.getAllUsers(filters);

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch users",
    });
  }
};

// Get user by ID
 
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await userService.getUserById(id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch user",
    });
  }
};

// Update user profile 
 
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updates = req.body;

    const user = await userService.updateUserProfile(userId, updates);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update profile",
    });
  }
};

// Update user (Admin only)

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const user = await userService.updateUser(id, updates);

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update user",
    });
  }
};

// Delete user (Admin only)

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await userService.deleteUser(id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to delete user",
    });
  }
};

// Get students by batch
 
export const getStudentsByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;

    const students = await userService.getStudentsByBatch(batchId);

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch students",
    });
  }
};

/**
 * Get all teachers
 */
export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await userService.getAllTeachers();

    res.status(200).json({
      success: true,
      count: teachers.length,
      data: teachers,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch teachers",
    });
  }
};

/**
 * Get user statistics
 */
export const getUserStats = async (req, res) => {
  try {
    const statistics = await userService.getUserStatistics();

    res.status(200).json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch user statistics",
    });
  }
};

/**
 * Search users
 */
export const searchUsers = async (req, res) => {
  try {
    const { query, role } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const users = await userService.searchUsers(query, role);

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to search users",
    });
  }
};

/**
 * Update user profile data (interests, career goals, strengths)
 */
export const updateUserProfileData = async (req, res) => {
  try {
    const userId = req.user._id;
    const profileData = req.body;

    const user = await userService.updateUserProfileData(userId, profileData);

    res.status(200).json({
      success: true,
      message: "Profile data updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update profile data",
    });
  }
};

/**
 * Get users by role
 */
export const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;

    const users = await userService.getUsersByRole(role);

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch users by role",
    });
  }
};