import Attendance from "../models/attendance.model.js";
import User from "../models/user.model.js";
import Batch from "../models/batch.model.js";
import Timetable from "../models/timetable.model.js";
import { getCurrentISTTime } from "../utils/timezone.js";

// Calculate distance between two coordinates using Haversine formula

const CAMPUS_LOCATION = {
  latitude: parseFloat(process.env.CAMPUS_LATITUDE || '31.26234'),
  longitude: parseFloat(process.env.CAMPUS_LONGITUDE || '75.70266'),
};

const ALLOWED_RADIUS = parseFloat(process.env.ATTENDANCE_RADIUS || '100');

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; 
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;
  const deltaLat = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLon = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) + Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; 
};

// Mark attendance using QR code

export const markAttendanceByQR = async (userId, sessionId, qrToken, location) => {
  // Validate session exists and QR token matches
  const session = await Timetable.findById(sessionId).populate("batch", "students");
  if (!session) {
    throw new Error("Session not found");
  }

  if (session.qrToken !== qrToken) {
    throw new Error("Invalid QR code");
  }

  // Check if session is active
  const now = getCurrentISTTime();
  if (session.status !== "Active") {
    throw new Error("Session is not active");
  }

  // Check if student is in the batch
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (user.role !== "Student") {
    throw new Error("Only students can mark attendance");
  }

  const isInBatch = session.batch.students.some((studentId) => studentId.toString() === userId.toString());
  if (!isInBatch) {
    throw new Error("You are not enrolled in this batch");
  }

  // Check for duplicate attendance
  const existingAttendance = await Attendance.findOne({
    user: userId,
    session: sessionId,
  });

  if (existingAttendance) {
    throw new Error("Attendance already marked for this session");
  }

  // Calculate distance from campus if location provided
  let distanceFromCampus = null;
  if (location) {
    distanceFromCampus = calculateDistance(
      location.latitude,
      location.longitude,
      CAMPUS_LOCATION.latitude,
      CAMPUS_LOCATION.longitude
    );
  }

  // Create attendance record
  const attendance = await Attendance.create({
    user: userId,
    timetable: sessionId,
    batch: session.batch._id,
    status: "Present",
    method: "QR",
    location: location || null,
    distanceFromCampus,
    markedAt: now,
  });

  return await Attendance.findById(attendance._id)
    .populate("user", "name email registrationNumber")
    .populate("timetable", "subject date startTime endTime")
    .populate("batch", "name");
};

// Mark attendance using geolocation

export const markAttendanceByLocation = async (userId, sessionId, location, campusRadius = 500) => {
  // Validate session exists
  const session = await Timetable.findById(sessionId).populate("batch", "students");
  if (!session) {
    throw new Error("Session not found");
  }

  if (session.status !== "Active") {
    throw new Error("Session is not active");
  }

  // Check if student is in the batch
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (user.role !== "Student") {
    throw new Error("Only students can mark attendance");
  }

  const isInBatch = session.batch.students.some((studentId) => studentId.toString() === userId.toString());
  if (!isInBatch) {
    throw new Error("You are not enrolled in this batch");
  }

  // Check for duplicate attendance
  const existingAttendance = await Attendance.findOne({
    user: userId,
    session: sessionId,
  });

  if (existingAttendance) {
    throw new Error("Attendance already marked for this session");
  }

  // Validate location
  if (!location || !location.latitude || !location.longitude) {
    throw new Error("Valid location is required");
  }

  // Calculate distance from campus
  const distanceFromCampus = calculateDistance(
    location.latitude,
    location.longitude,
    CAMPUS_LOCATION.latitude,
    CAMPUS_LOCATION.longitude
  );

  // Check if within campus radius
  if (distanceFromCampus > campusRadius) {
    throw new Error(`You must be within ${campusRadius}m of campus. Current distance: ${Math.round(distanceFromCampus)}m`);
  }

  // Create attendance record
  const attendance = await Attendance.create({
    user: userId,
    timetable: sessionId,
    batch: session.batch._id,
    status: "Present",
    method: "Location",
    location,
    distanceFromCampus,
    markedAt: getCurrentISTTime(),
  });

  return await Attendance.findById(attendance._id)
    .populate("user", "name email registrationNumber")
    .populate("timetable", "subject date startTime endTime")
    .populate("batch", "name");
};

// Get attendance records with filters

export const getAttendanceRecords = async (filters = {}) => {
  const query = {};

  if (filters.userId) {
    query.user = filters.userId;
  }

  if (filters.sessionId) {
    query.session = filters.sessionId;
  }

  if (filters.batchId) {
    query.batch = filters.batchId;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.method) {
    query.method = filters.method;
  }

  if (filters.startDate || filters.endDate) {
    query.markedAt = {};
    if (filters.startDate) {
      query.markedAt.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query.markedAt.$lte = new Date(filters.endDate);
    }
  }

  const attendance = await Attendance.find(query)
    .sort({ markedAt: -1 })
    .populate("user", "name email registrationNumber")
    .populate("session", "subject date startTime endTime")
    .populate("batch", "name");

  return attendance;
};

// Get student attendance records

export const getStudentAttendance = async (userId, filters = {}) => {
  const query = { user: userId };

  if (filters.batchId) {
    query.batch = filters.batchId;
  }

  if (filters.startDate || filters.endDate) {
    query.markedAt = {};
    if (filters.startDate) {
      query.markedAt.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query.markedAt.$lte = new Date(filters.endDate);
    }
  }

  const attendance = await Attendance.find(query)
    .sort({ markedAt: -1 })
    .populate("session", "subject date startTime endTime")
    .populate("batch", "name");

  // Calculate statistics
  const total = attendance.length;
  const present = attendance.filter((a) => a.status === "Present").length;
  const absent = attendance.filter((a) => a.status === "Absent").length;
  const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;

  return {
    attendance,
    statistics: {
      total,
      present,
      absent,
      percentage,
    },
  };
};

// Get batch attendance summary

export const getBatchAttendanceSummary = async (batchId, sessionId = null) => {
  const query = { batch: batchId };

  if (sessionId) {
    query.session = sessionId;
  }

  const attendance = await Attendance.find(query)
    .populate("user", "name email registrationNumber")
    .populate("session", "subject date startTime endTime");

  const batch = await Batch.findById(batchId).populate("students", "name email registrationNumber");

  const totalStudents = batch.students.length;
  const presentCount = attendance.filter((a) => a.status === "Present").length;
  const absentCount = totalStudents - presentCount;
  const percentage = totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(2) : 0;

  return {
    batch: {
      id: batch._id,
      name: batch.name,
      totalStudents,
    },
    attendance,
    summary: {
      present: presentCount,
      absent: absentCount,
      percentage,
    },
  };
};

// Update attendance record

export const updateAttendance = async (attendanceId, updateData) => {
  const attendance = await Attendance.findByIdAndUpdate(attendanceId, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("user", "name email registrationNumber")
    .populate("session", "subject date startTime endTime")
    .populate("batch", "name");

  if (!attendance) {
    throw new Error("Attendance record not found");
  }

  return attendance;
};

// Delete attendance record

export const deleteAttendance = async (attendanceId) => {
  const attendance = await Attendance.findByIdAndDelete(attendanceId);

  if (!attendance) {
    throw new Error("Attendance record not found");
  }

  return attendance;
};

// Bulk mark attendance (for teachers/admins)
 
export const bulkMarkAttendance = async (sessionId, studentIds, status = "Present") => {
  const session = await Session.findById(sessionId);
  if (!session) {
    throw new Error("Session not found");
  }

  const attendanceRecords = [];

  for (const studentId of studentIds) {
    // Check if attendance already exists
    const existing = await Attendance.findOne({
      user: studentId,
      session: sessionId,
    });

    if (!existing) {
      const attendance = await Attendance.create({
        user: studentId,
        session: sessionId,
        batch: session.batch,
        status,
        method: "Manual",
        markedAt: getCurrentISTTime(),
      });

      attendanceRecords.push(attendance);
    }
  }

  return await Attendance.find({ _id: { $in: attendanceRecords.map((a) => a._id) } })
    .populate("user", "name email registrationNumber")
    .populate("session", "subject date startTime endTime");
};

// Get attendance statistics for a date range

export const getAttendanceStatistics = async (userId, batchId, startDate, endDate) => {
  const query = {};

  if (userId) {
    query.user = userId;
  }

  if (batchId) {
    query.batch = batchId;
  }

  if (startDate || endDate) {
    query.markedAt = {};
    if (startDate) {
      query.markedAt.$gte = startDate;
    }
    if (endDate) {
      query.markedAt.$lte = endDate;
    }
  }

  const total = await Attendance.countDocuments(query);
  const present = await Attendance.countDocuments({ ...query, status: "Present" });
  const absent = await Attendance.countDocuments({ ...query, status: "Absent" });
  const late = await Attendance.countDocuments({ ...query, status: "Late" });

  const byMethod = await Attendance.aggregate([
    { $match: query },
    { $group: { _id: "$method", count: { $sum: 1 } } },
  ]);

  return {
    total,
    present,
    absent,
    late,
    percentage: total > 0 ? ((present / total) * 100).toFixed(2) : 0,
    byMethod: byMethod.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
  };
};

// Get attendance records for a specific session

export const getAttendanceBySession = async (sessionId) => {
  const attendance = await Attendance.find({ session: sessionId })
    .sort({ markedAt: -1 })
    .populate("user", "name email registrationNumber")
    .populate("session", "subject date startTime endTime")
    .populate("batch", "name");

  return attendance;
};

export default {
  calculateDistance,
  markAttendanceByQR,
  markAttendanceByLocation,
  getAttendanceRecords,
  getStudentAttendance,
  getBatchAttendanceSummary,
  updateAttendance,
  deleteAttendance,
  bulkMarkAttendance,
  getAttendanceStatistics,
  getAttendanceBySession,
};