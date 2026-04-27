import User from "../models/user.model.js";
import Batch from "../models/batch.model.js";

const ROLE_MAP = {
  admin: "Admin",
  teacher: "Teacher",
  student: "Student",
};

const normalizeRole = (role) => {
  if (!role || typeof role !== "string") {
    return role;
  }

  return ROLE_MAP[role.trim().toLowerCase()] || role;
};

//  Get all users with filters

export const getAllUsers = async (filters = {}) => {
  const query = {};

  if (filters.role) {
    query.role = normalizeRole(filters.role);
  }

  if (filters.batch) {
    query.batch = filters.batch;
  }

  if (filters.isVerified !== undefined) {
    query.isVerified = filters.isVerified;
  }

  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { email: { $regex: filters.search, $options: "i" } },
      { enrollmentNumber: { $regex: filters.search, $options: "i" } },
    ];
  }

  const users = await User.find(query)
    .select("-password -verificationCode -passwordResetToken -passwordResetExpires")
    .sort({ createdAt: -1 })
    .populate("batch", "name department year");

  return users;
};

//  Get user by ID

export const getUserById = async (userId) => {
  const user = await User.findById(userId)
    .select("-password -verificationCode -passwordResetToken -passwordResetExpires")
    .populate("batch", "name department year subjects");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// Update user profile

export const updateUserProfile = async (userId, updateData) => {
  // Prevent updating sensitive fields
  delete updateData.password;
  delete updateData.role;
  delete updateData.isVerified;
  delete updateData.verificationCode;
  delete updateData.passwordResetToken;
  delete updateData.passwordResetExpires;

  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  })
    .select("-password -verificationCode -passwordResetToken -passwordResetExpires")
    .populate("batch", "name department year");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

//  Update user (Admin only - can update role, batch, etc.)

export const updateUser = async (userId, updateData) => {
  // Prevent updating password through this method
  delete updateData.password;
  delete updateData.verificationCode;
  delete updateData.passwordResetToken;
  delete updateData.passwordResetExpires;

  if (updateData.role !== undefined) {
    updateData.role = normalizeRole(updateData.role);
    if (!["Admin", "Teacher", "Student"].includes(updateData.role)) {
      const error = new Error("Invalid role. Allowed values are Admin, Teacher, or Student");
      error.statusCode = 400;
      throw error;
    }
  }

  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  })
    .select("-password -verificationCode -passwordResetToken -passwordResetExpires")
    .populate("batch", "name department year");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// Delete user

export const deleteUser = async (userId) => {
  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw new Error("User not found");
  }

  // Remove user from batch if they're a student
  if (user.batch) {
    await Batch.findByIdAndUpdate(user.batch, {
      $pull: { students: userId },
    });
  }

  return user;
};

// Get students by batch

export const getStudentsByBatch = async (batchId, filters = {}) => {
  const query = {
    role: "Student",
    batch: batchId,
  };

  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { email: { $regex: filters.search, $options: "i" } },
      { enrollmentNumber: { $regex: filters.search, $options: "i" } },
    ];
  }

  const students = await User.find(query)
    .select("-password -verificationCode -passwordResetToken -passwordResetExpires")
    .sort({ name: 1 })
    .populate("batch", "name department year");

  // Calculate attendance percentage for each student
  const Attendance = (await import("../models/attendance.model.js")).default;
  
  const studentsWithAttendance = await Promise.all(
    students.map(async (student) => {
      const studentObj = student.toObject();
      
      try {
        // Get total attendance records
        const totalAttendance = await Attendance.countDocuments({
          user: student._id,
          batch: batchId,
        });

        // Get present attendance records
        const presentCount = await Attendance.countDocuments({
          user: student._id,
          batch: batchId,
          status: "Present",
        });

        // Calculate percentage
        const attendancePercentage = totalAttendance > 0 
          ? Math.round((presentCount / totalAttendance) * 100) 
          : 0;

        studentObj.attendancePercentage = attendancePercentage;
        studentObj.totalClasses = totalAttendance;
        studentObj.presentCount = presentCount;
      } catch (error) {
        console.error(`Error calculating attendance for student ${student._id}:`, error);
        studentObj.attendancePercentage = 0;
        studentObj.totalClasses = 0;
        studentObj.presentCount = 0;
      }

      return studentObj;
    })
  );

  return studentsWithAttendance;
};

// Get all teachers

export const getAllTeachers = async (filters = {}) => {
  const query = { role: "Teacher" };

  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { email: { $regex: filters.search, $options: "i" } },
    ];
  }

  const teachers = await User.find(query)
    .select("-password -verificationCode -passwordResetToken -passwordResetExpires")
    .sort({ name: 1 });

  return teachers;
};

//  Get user statistics
 
export const getUserStatistics = async (role = null) => {
  const query = role ? { role } : {};

  const total = await User.countDocuments(query);
  const verified = await User.countDocuments({ ...query, isVerified: true });
  const unverified = await User.countDocuments({ ...query, isVerified: false });

  const byRole = await User.aggregate([
    { $group: { _id: "$role", count: { $sum: 1 } } },
  ]);

  const byBatch = await User.aggregate([
    { $match: { role: "Student", batch: { $exists: true } } },
    { $group: { _id: "$batch", count: { $sum: 1 } } },
    { $lookup: { from: "batches", localField: "_id", foreignField: "_id", as: "batchInfo" } },
    { $unwind: "$batchInfo" },
    { $project: { batchName: "$batchInfo.name", count: 1 } },
  ]);

  return {
    total,
    verified,
    unverified,
    byRole: byRole.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    byBatch: byBatch.map((item) => ({
      batchId: item._id,
      batchName: item.batchName,
      studentCount: item.count,
    })),
  };
};

//  Search users

export const searchUsers = async (searchTerm, filters = {}) => {
  const query = {
    $or: [
      { name: { $regex: searchTerm, $options: "i" } },
      { email: { $regex: searchTerm, $options: "i" } },
      { enrollmentNumber: { $regex: searchTerm, $options: "i" } },
    ],
  };

  if (filters.role) {
    query.role = normalizeRole(filters.role);
  }

  if (filters.batch) {
    query.batch = filters.batch;
  }

  const users = await User.find(query)
    .select("-password -verificationCode -passwordResetToken -passwordResetExpires")
    .limit(filters.limit || 20)
    .populate("batch", "name department year");

  return users;
};

// Update user interests, career goals, and strengths
 
export const updateUserProfileData = async (userId, profileData) => {
  const updateFields = {};

  if (profileData.interests !== undefined) {
    updateFields.interests = profileData.interests;
  }

  if (profileData.careerGoals !== undefined) {
    updateFields.careerGoals = profileData.careerGoals;
  }

  if (profileData.strengths !== undefined) {
    updateFields.strengths = profileData.strengths;
  }

  const user = await User.findByIdAndUpdate(userId, updateFields, {
    new: true,
    runValidators: true,
  })
    .select("-password -verificationCode -passwordResetToken -passwordResetExpires")
    .populate("batch", "name department year");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// Get users by role


export const getUsersByRole = async (role) => {
  const normalizedRole = normalizeRole(role);

  const users = await User.find({ role: normalizedRole })
    .select("-password -verificationCode -passwordResetToken -passwordResetExpires")
    .sort({ name: 1 })
    .populate("batch", "name department year");

  return users;
};

// Verify user email

export const verifyUserEmail = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      isVerified: true,
      verificationCode: undefined,
    },
    { new: true }
  ).select("-password -verificationCode -passwordResetToken -passwordResetExpires");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};


export default {
  getAllUsers,
  getUserById,
  updateUserProfile,
  updateUser,
  deleteUser,
  getStudentsByBatch,
  getAllTeachers,
  getUserStatistics,
  searchUsers,
  updateUserProfileData,
  getUsersByRole,
  verifyUserEmail,
};
