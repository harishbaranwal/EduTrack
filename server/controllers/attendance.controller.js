import Attendance from "../models/attendance.model.js";
import Timetable from "../models/timetable.model.js";
import Batch from "../models/batch.model.js";
import User from "../models/user.model.js";
import Device from "../models/device.model.js";
import jwt from "jsonwebtoken";
import { getISTDayName, timeToMinutes, getISTDateString, getISTTimeString } from "../utils/timezone.js";
import { calculateDistance } from "../services/attendance.service.js";

// In-memory store for active QR tokens (short-lived cache)
const qrTokenCache = new Map();

// In-memory store for device cooldown: deviceId -> { lastStudentId, lastUsedAt }
const deviceCooldownCache = new Map();
const DEVICE_COOLDOWN_MS = 20 * 60 * 1000; // 20 minutes

// Clean up expired QR tokens and device cooldowns every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of qrTokenCache.entries()) {
    if (value.expiresAt < now) {
      qrTokenCache.delete(key);
    }
  }
  // Clean expired device cooldowns
  for (const [key, value] of deviceCooldownCache.entries()) {
    if (now - value.lastUsedAt > DEVICE_COOLDOWN_MS) {
      deviceCooldownCache.delete(key);
    }
  }
}, 60000);

// Generate a random short QR code ID
const generateQRCode = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

// Campus location constants
const CAMPUS_LOCATION = {
  latitude: parseFloat(process.env.CAMPUS_LATITUDE || '31.26234'),
  longitude: parseFloat(process.env.CAMPUS_LONGITUDE || '75.70266'),
};

const ALLOWED_RADIUS = parseFloat(process.env.ATTENDANCE_RADIUS || '5000');

// Helper function to validate teacher permissions for a subject
const validateTeacherPermission = async (teacherId, batchId, subject, date = null) => {
  // Get the day name for the attendance date, or use today if not provided
  let dayName;
  if (date) {
    // Parse the date string and get day name in IST context
    const attendanceDate = new Date(date);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    dayName = days[attendanceDate.getUTCDay()];
  } else {
    // Use current IST day if no date provided
    dayName = getISTDayName();
  }
    
  const timetable = await Timetable.findOne({
    batch: batchId,
    day: dayName,
  });
  
  if (!timetable) {
    return { valid: false, message: `No classes scheduled for ${dayName}` };
  }

  const teacherClass = timetable.classes.find(
    c => c.subject === subject && c.teacher.toString() === teacherId
  );

  if (!teacherClass) {
    return { valid: false, message: "You are not authorized to mark attendance for this subject" };
  }

  return { valid: true, timetable, classInfo: teacherClass };
};

// Helper function to create or update attendance
const createOrUpdateAttendance = async (attendanceData, existingAttendance = null) => {
  if (existingAttendance) {
    // Update existing attendance
    Object.assign(existingAttendance, attendanceData);
    if (attendanceData.method === "Manual") {
      existingAttendance.modifiedBy = attendanceData.markedBy;
      existingAttendance.modifiedAt = new Date();
    }
    await existingAttendance.save();
    return existingAttendance;
  } else {
    // Create new attendance
    const attendance = new Attendance(attendanceData);
    await attendance.save();
    return attendance;
  }
};

// Mark attendance using QR code
export const markAttendanceByQR = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { qrData, qrToken, latitude, longitude, deviceId } = req.body;

    // Support both short QR code (from cache) and direct token
    let resolvedToken = qrToken;
    if (!resolvedToken && qrData) {
      // Try to resolve short QR code from cache
      const cacheEntry = qrTokenCache.get(qrData);
      if (cacheEntry) {
        resolvedToken = cacheEntry.token;
      }
    }

    if (!resolvedToken) {
      return res.status(400).json({
        success: false,
        message: "QR code data is required",
      });
    }

    // Device binding: require deviceId and enforce uniqueness
    if (!deviceId) {
      return res.status(400).json({ success: false, message: "deviceId is required" });
    }

    // Check device cooldown: two different students can't use same device within 20 min
    const cooldownEntry = deviceCooldownCache.get(deviceId);
    if (cooldownEntry && cooldownEntry.lastStudentId !== studentId) {
      const elapsed = Date.now() - cooldownEntry.lastUsedAt;
      if (elapsed < DEVICE_COOLDOWN_MS) {
        const remaining = Math.ceil((DEVICE_COOLDOWN_MS - elapsed) / 60000);
        return res.status(403).json({
          success: false,
          message: `This device was recently used by another student. Please wait ${remaining} minute(s) or use a different device.`,
        });
      }
    }

    // Check device binding: if device exists and bound to different user -> reject
    const existingDevice = await Device.findOne({ deviceId });
    if (existingDevice && existingDevice.user.toString() !== studentId) {
      return res.status(403).json({ success: false, message: "This device is already bound to another student" });
    }

    // If device not present, auto-register it and bind to this student
    if (!existingDevice) {
      await Device.create({ deviceId, user: studentId, userAgent: req.headers['user-agent'] || 'unknown' });
    } else {
      // update lastSeen
      existingDevice.lastSeen = new Date();
      await existingDevice.save();
    }

    if (latitude == null || longitude == null) {
      return res.status(400).json({
        success: false,
        message: "Location is required to mark attendance",
      });
    }

    // Validate signed QR token
    let qrInfo;
    try {
      const secret = process.env.QR_SECRET || process.env.JWT_SECRET || 'dev-qr-secret';
      qrInfo = jwt.verify(resolvedToken, secret);
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Invalid or expired QR code. Please ask your teacher to generate a new one.' });
    }

    const { timetableId, subject, teacherId, date, startTime, endTime, batchId, teacherLatitude, teacherLongitude } = qrInfo;

    // Verify student belongs to this batch
    const batch = await Batch.findById(batchId);
    if (!batch || !batch.students.includes(studentId)) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this batch",
      });
    }

    // Check distance from campus
    const distanceFromCampus = calculateDistance(
      parseFloat(latitude),
      parseFloat(longitude),
      CAMPUS_LOCATION.latitude,
      CAMPUS_LOCATION.longitude
    );

    if (distanceFromCampus > ALLOWED_RADIUS) {
      return res.status(400).json({
        success: false,
        message: `You are ${distanceFromCampus.toFixed(0)}m away from campus. You must be within ${ALLOWED_RADIUS}m to mark attendance.`,
        data: { distance: distanceFromCampus, allowedRadius: ALLOWED_RADIUS },
      });
    }

    // Check distance from teacher
    if (teacherLatitude != null && teacherLongitude != null) {
      const distanceFromTeacher = calculateDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        teacherLatitude,
        teacherLongitude
      );

      const TEACHER_RADIUS = 5000;
      if (distanceFromTeacher > TEACHER_RADIUS) {
        return res.status(400).json({
          success: false,
          message: "Go to classroom, you are too faraway from class.",
          data: { distance: distanceFromTeacher, allowedRadius: TEACHER_RADIUS },
        });
      }
    }

    // Check if attendance already exists
    const existingAttendance = await Attendance.findOne({
      user: studentId,
      subject: subject,
      date: new Date(date),
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: "Attendance already marked for this subject today",
      });
    }

    // Create attendance record
    const attendanceData = {
      user: studentId,
      batch: batchId,
      timetable: timetableId,
      subject: subject,
      teacher: teacherId,
      date: new Date(date),
      classStartTime: startTime,
      classEndTime: endTime,
      status: "Present",
      method: "QR_Scan+Location",
      markedBy: studentId,
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      distanceFromCampus: distanceFromCampus,
      deviceId,
      qrToken: resolvedToken || null,
    };

    const attendance = await createOrUpdateAttendance(attendanceData);
    await attendance.populate([
      { path: "user", select: "name email registrationNumber" },
      { path: "teacher", select: "name email" },
      { path: "batch", select: "name" }
    ]);

    // Update device cooldown cache after successful attendance
    deviceCooldownCache.set(deviceId, {
      lastStudentId: studentId,
      lastUsedAt: Date.now(),
    });

    res.status(200).json({
      success: true,
      message: "Attendance marked successfully via QR code and location",
      data: attendance,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to mark attendance",
    });
  }
};

// Verify student location against teacher's active location (Stage 1)
export const verifyStudentLocation = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { latitude, longitude, subject, batchId } = req.body;

    // Validate required fields
    if (!latitude || !longitude || !subject || !batchId) {
      return res.status(400).json({
        success: false,
        message: "Latitude, longitude, subject, and batch ID are required",
      });
    }

    // Verify student belongs to this batch
    const batch = await Batch.findById(batchId);
    if (!batch || !batch.students.includes(studentId)) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this batch",
      });
    }

    // Get today's timetable to find the class
    const today = getISTDayName();
    const timetable = await Timetable.findOne({ batch: batchId, day: today });

    // If timetable data is missing on the deployed server, still allow the student
    // to proceed after campus verification. Stage 2 QR validation still enforces
    // the actual session, subject, and teacher data from the signed token.
    const classInfo = timetable?.classes?.find(c => c.subject === subject) || null;

    // Check distance from campus
    const distanceFromCampus = calculateDistance(
      parseFloat(latitude), parseFloat(longitude),
      CAMPUS_LOCATION.latitude, CAMPUS_LOCATION.longitude
    );

    if (distanceFromCampus > ALLOWED_RADIUS) {
      return res.status(400).json({
        success: false,
        message: `You are ${distanceFromCampus.toFixed(0)}m away from campus. You must be within ${ALLOWED_RADIUS}m.`,
      });
    }

    // Check distance from teacher if their location is available in cache
    const teacherId = classInfo?.teacher?.toString();
    const teacherLoc = teacherId ? teacherLocationCache.get(teacherId) : null;
    let distanceFromTeacher = null;

    if (teacherLoc) {
      distanceFromTeacher = calculateDistance(
        parseFloat(latitude), parseFloat(longitude),
        teacherLoc.latitude, teacherLoc.longitude
      );

      const TEACHER_RADIUS = 5000;
      if (distanceFromTeacher > TEACHER_RADIUS) {
        return res.status(400).json({
          success: false,
          message: "Go to classroom, you are too faraway from class.",
        });
      }
    }
    // If teacher location is not in cache, we still allow campus-verified students
    // to proceed — the QR scan (Stage 2) will verify teacher proximity using the
    // teacher coordinates embedded in the signed QR token.

    // Location verified — student can now proceed to scan QR
    const message = distanceFromTeacher !== null
      ? "Location verified! You are near your teacher. Please scan the QR code now."
      : "Campus location verified! Please scan the QR code now.";

    res.status(200).json({
      success: true,
      message,
      data: {
        locationVerified: true,
        distanceFromCampus: distanceFromCampus.toFixed(1),
        distanceFromTeacher: distanceFromTeacher !== null ? distanceFromTeacher.toFixed(1) : null,
        subject,
        batchId,
        fallbackMode: !classInfo,
      },
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to verify location",
    });
  }
};

// In-memory store for teacher active locations
const teacherLocationCache = new Map();

// Teacher: share/update location for current class
export const updateTeacherLocation = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { latitude, longitude } = req.body;

    if (latitude == null || longitude == null) {
      return res.status(400).json({ success: false, message: "Latitude and longitude are required" });
    }

    teacherLocationCache.set(teacherId, {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      updatedAt: Date.now(),
    });

    res.status(200).json({
      success: true,
      message: "Location shared successfully. Students can now verify their location.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Failed to update location" });
  }
};

// Teacher: stop sharing location
export const stopTeacherLocation = async (req, res) => {
  try {
    const teacherId = req.user.id;
    teacherLocationCache.delete(teacherId);
    res.status(200).json({ success: true, message: "Location sharing stopped." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Failed to stop location sharing" });
  }
};

// Get teacher location status (for students to check)
export const getTeacherLocationStatus = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const loc = teacherLocationCache.get(teacherId);
    res.status(200).json({
      success: true,
      data: {
        isSharing: !!loc,
        updatedAt: loc?.updatedAt || null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Failed to get teacher location" });
  }
};

// Get student's own attendance
export const getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { subject, startDate, endDate, month, year } = req.query;

    // Build query
    const query = { user: studentId };
    
    if (subject) query.subject = subject;

    // Date filtering
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      query.date = { $gte: start, $lte: end };
    }

    const attendance = await Attendance.find(query)
      .populate("batch", "name")
      .populate("teacher", "name")
      .sort({ date: -1 });

    // Calculate statistics
    const stats = {
      total: attendance.length,
      present: attendance.filter(a => a.status === "Present").length,
      absent: attendance.filter(a => a.status === "Absent").length,
    };
    stats.percentage = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      message: "Attendance fetched successfully",
      data: { attendance, stats },
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch attendance",
    });
  }
};

// Get class attendance (for teachers/admins)
export const getClassAttendance = async (req, res) => {
  try {
    const { batchId, subject, date } = req.query;
    const userId = req.user.id;

    if (!batchId || !subject || !date) {
      return res.status(400).json({
        success: false,
        message: "Batch ID, subject, and date are required",
      });
    }

    // Verify teacher has permission for this subject (if not admin)
    const user = await User.findById(userId);
    if (user.role === "Teacher") {
      const validation = await validateTeacherPermission(userId, batchId, subject, date);
      if (!validation.valid) {
        return res.status(403).json({
          success: false,
          message: validation.message,
        });
      }
    }

    // Get batch with students
    const batch = await Batch.findById(batchId).populate("students", "name email registrationNumber");
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Get attendance records for this class
    const attendance = await Attendance.find({
      batch: batchId,
      subject: subject,
      date: new Date(date),
    }).populate("user", "name email registrationNumber");

    // Create attendance map
    const attendanceMap = {};
    attendance.forEach(a => {
      attendanceMap[a.user._id.toString()] = a;
    });

    // Build response with all students
    const classAttendance = batch.students.map(student => ({
      student: student,
      attendance: attendanceMap[student._id.toString()] || null,
      status: attendanceMap[student._id.toString()]?.status || "Not Marked",
    }));

    // Calculate statistics
    const stats = {
      total: batch.students.length,
      present: attendance.filter(a => a.status === "Present").length,
      absent: attendance.filter(a => a.status === "Absent").length,
      notMarked: batch.students.length - attendance.length,
    };

    res.status(200).json({
      success: true,
      message: "Class attendance fetched successfully",
      data: { classAttendance, stats, batch: { name: batch.name, _id: batch._id } },
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch class attendance",
    });
  }
};

// Generate QR data for attendance

export const generateQRData = async (req, res) => {
  try {
    const { batchId, subject, latitude, longitude } = req.body;
    const teacherId = req.user.id;

    if (!batchId || !subject) {
      return res.status(400).json({
        success: false,
        message: "Batch ID and subject are required",
      });
    }

    if (latitude == null || longitude == null) {
      return res.status(400).json({
        success: false,
        message: "Teacher location is required to generate QR code",
      });
    }

    const currentDate = getISTDateString();

    // Verify teacher has permission for today's class
    const validation = await validateTeacherPermission(teacherId, batchId, subject, currentDate);
    if (!validation.valid) {
      return res.status(403).json({
        success: false,
        message: validation.message,
      });
    }

    // Change #2: QR generation only allowed within first 20 min of class start
    const currentTime = getISTTimeString();
    const currentMinutes = timeToMinutes(currentTime);
    const classStartMinutes = timeToMinutes(validation.classInfo.startTime);
    const QR_WINDOW_MINUTES = 20;

    if (currentMinutes > classStartMinutes + QR_WINDOW_MINUTES) {
      return res.status(400).json({
        success: false,
        message: `QR code generation is only available within the first ${QR_WINDOW_MINUTES} minutes of class start (${validation.classInfo.startTime}). The QR window has closed.`,
      });
    }
    
    // Generate a short QR code and store the full payload with teacher location
    const qrCode = generateQRCode();
    const qrPayload = {
      timetableId: validation.timetable._id,
      subject: subject,
      teacherId: teacherId,
      date: currentDate,
      startTime: validation.classInfo.startTime,
      endTime: validation.classInfo.endTime,
      batchId: batchId,
      teacherLatitude: parseFloat(latitude),
      teacherLongitude: parseFloat(longitude),
      iat: Math.floor(Date.now() / 1000),
    };

    const secret = process.env.QR_SECRET || process.env.JWT_SECRET || 'dev-qr-secret';
    const token = jwt.sign(qrPayload, secret, { expiresIn: '30s' });
    
    // Cache the token with short code (valid for 35 seconds to account for generation delay)
    qrTokenCache.set(qrCode, {
      token: token,
      payload: qrPayload,
      expiresAt: Date.now() + 35000
    });

    res.status(200).json({
      success: true,
      message: "QR code generated successfully",
      data: { qrData: qrCode }, // Send short code instead of full JWT
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to generate QR data",
    });
  }
};

// Manual attendance marking (Admin/Teacher)
export const markManualAttendance = async (req, res) => {
  try {
    const { studentId, batchId, subject, date, status, remarks } = req.body;
    const markedBy = req.user.id;

    // Validate required fields
    if (!studentId || !batchId || !subject || !date || !status) {
      return res.status(400).json({
        success: false,
        message: "Student ID, batch ID, subject, date, and status are required",
      });
    }

    // Validate status
    if (!["Present", "Absent"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'Present' or 'Absent'",
      });
    }

    // Verify user permissions (Teacher or Admin)
    const user = await User.findById(markedBy);
    if (!user || !["Teacher", "Admin"].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only teachers and admins can mark manual attendance",
      });
    }

    // Verify student exists and belongs to batch
    const student = await User.findById(studentId);
    if (!student || student.role !== "Student") {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const batch = await Batch.findById(batchId);
    if (!batch || !batch.students.includes(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Student not found in this batch",
      });
    }

    // If teacher, verify they teach this subject to this batch
    if (user.role === "Teacher") {
      const validation = await validateTeacherPermission(markedBy, batchId, subject, date);
      if (!validation.valid) {
        return res.status(403).json({
          success: false,
          message: validation.message,
        });
      }
    }

    // Check if attendance already exists
    const existingAttendance = await Attendance.findOne({
      user: studentId,
      subject: subject,
      date: new Date(date),
    });

    // Get timetable info for the attendance date
    const attendanceDate = new Date(date);
    const dayName = attendanceDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    const timetable = await Timetable.findOne({
      batch: batchId,
      day: dayName,
    });

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "No timetable found for this day and batch",
      });
    }

    const classInfo = timetable.classes.find(c => c.subject === subject);
    if (!classInfo) {
      return res.status(404).json({
        success: false,
        message: "Subject not found in timetable for this day",
      });
    }

    // Prepare attendance data with all required fields
    let attendanceData = {
      user: studentId,
      batch: batchId,
      timetable: timetable._id,
      subject: subject,
      teacher: classInfo.teacher,
      date: new Date(date),
      classStartTime: classInfo.startTime,
      classEndTime: classInfo.endTime,
      status: status,
      method: "Manual",
      markedBy: markedBy,
      remarks: remarks || "",
    };
    const attendance = await createOrUpdateAttendance(attendanceData, existingAttendance);
    // Populate the response
    await attendance.populate([
      { path: "user", select: "name email registrationNumber" },
      { path: "markedBy", select: "name email role" },
      { path: "modifiedBy", select: "name email role" }
    ]);

    res.status(200).json({
      success: true,
      message: attendance.modifiedAt ? "Attendance updated successfully" : "Attendance marked successfully",
      data: attendance,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to mark attendance",
    });
  }
};

// Bulk manual attendance marking for a class
export const markBulkManualAttendance = async (req, res) => {
  try {
    const { batchId, subject, date, attendanceList } = req.body;
    const markedBy = req.user.id;

    // Validate required fields
    if (!batchId || !subject || !date || !Array.isArray(attendanceList) || attendanceList.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Batch ID, subject, date, and attendance list are required",
      });
    }

    // Verify user permissions (Teacher or Admin)
    const user = await User.findById(markedBy);
    if (!user || !["Teacher", "Admin"].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only teachers and admins can mark bulk attendance",
      });
    }

    // Verify batch exists
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // If teacher, verify they teach this subject to this batch
    if (user.role === "Teacher") {
      const validation = await validateTeacherPermission(markedBy, batchId, subject, date);
      if (!validation.valid) {
        return res.status(403).json({
          success: false,
          message: validation.message,
        });
      }
    }

    const results = {
      successful: [],
      failed: [],
    };

    // Get timetable info for the attendance date (not today)
    let dayName;
    if (date) {
      const attendanceDate = new Date(date);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      dayName = days[attendanceDate.getUTCDay()];
    } else {
      dayName = getISTDayName();
    }
    
    const timetable = await Timetable.findOne({
      batch: batchId,
      day: dayName,
    });

    // Process each student attendance
    for (const item of attendanceList) {
      try {
        const { studentId, status, remarks } = item;

        // Validate individual entry
        if (!studentId || !status || !["Present", "Absent"].includes(status)) {
          results.failed.push({
            studentId,
            error: "Invalid student ID or status",
          });
          continue;
        }

        // Verify student belongs to batch
        if (!batch.students.includes(studentId)) {
          results.failed.push({
            studentId,
            error: "Student not found in this batch",
          });
          continue;
        }

        // Check if attendance already exists
        const existingAttendance = await Attendance.findOne({
          user: studentId,
          subject: subject,
          date: new Date(date),
        });

        if (!timetable) {
          results.failed.push({
            studentId: item.studentId,
            error: "No timetable found for this day and batch",
          });
          continue;
        }

        const classInfo = timetable.classes.find(c => c.subject === subject);
        if (!classInfo) {
          results.failed.push({
            studentId: item.studentId,
            error: "Subject not found in timetable for this day",
          });
          continue;
        }

        // Prepare attendance data with all required fields
        let attendanceData = {
          user: studentId,
          batch: batchId,
          timetable: timetable._id,
          subject: subject,
          teacher: classInfo.teacher,
          date: new Date(date),
          classStartTime: classInfo.startTime,
          classEndTime: classInfo.endTime,
          status: status,
          method: "Manual",
          markedBy: markedBy,
          remarks: remarks || "",
        };

        const attendance = await createOrUpdateAttendance(attendanceData, existingAttendance);
        await attendance.populate("user", "name email registrationNumber");

        results.successful.push({
          studentId,
          name: attendance.user.name,
          status,
          action: attendance.modifiedAt ? "updated" : "created",
        });

      } catch (error) {
        results.failed.push({
          studentId: item.studentId,
          error: error.message,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Bulk attendance processing completed. ${results.successful.length} successful, ${results.failed.length} failed`,
      data: results,
    });

  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to mark bulk attendance",
    });
  }
};

// Get attendance history with manual modifications
export const getAttendanceHistory = async (req, res) => {
  try {
    const { studentId, batchId, subject, startDate, endDate } = req.query;
    const userId = req.user.id;

    // Build filter object
    const filter = {};
    
    if (studentId) {
      const student = await User.findById(studentId);
      if (!student || student.role !== "Student") {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }
      filter.user = studentId;
    }

    if (batchId) filter.batch = batchId;
    if (subject) filter.subject = subject;

    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // For teachers, only show their classes unless they're admin
    const user = await User.findById(userId);
    if (user.role === "Teacher") {
      const teacherTimetables = await Timetable.find({
        "classes.teacher": userId
      });

      const teacherSubjects = new Set();
      teacherTimetables.forEach(timetable => {
        timetable.classes.forEach(classInfo => {
          if (classInfo.teacher.toString() === userId) {
            teacherSubjects.add(classInfo.subject);
          }
        });
      });

      if (subject) {
        if (!teacherSubjects.has(subject)) {
          return res.status(403).json({
            success: false,
            message: "You are not authorized to view attendance for this subject",
          });
        }
      } else {
        filter.subject = { $in: Array.from(teacherSubjects) };
      }
    }

    // Fetch attendance records
    const attendance = await Attendance.find(filter)
      .populate("user", "name email registrationNumber")
      .populate("batch", "name")
      .populate("teacher", "name email")
      .populate("markedBy", "name email role")
      .populate("modifiedBy", "name email role")
      .sort({ date: -1, createdAt: -1 });

    // Calculate statistics
    const stats = {
      total: attendance.length,
      present: attendance.filter(a => a.status === "Present").length,
      absent: attendance.filter(a => a.status === "Absent").length,
      manual: attendance.filter(a => a.method === "Manual").length,
      modified: attendance.filter(a => a.modifiedBy).length,
    };

    stats.presentPercentage = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      message: "Attendance history retrieved successfully",
      data: {
        attendance,
        stats,
        filters: { studentId, batchId, subject, startDate, endDate },
      },
    });

  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to get attendance history",
    });
  }
};

// Get available classes for today (for location-based attendance)
export const getTodayClasses = async (req, res) => {
  try {
    const studentId = req.user.id;
    
    // Get student's batch
    const student = await User.findById(studentId).populate('batch');
    if (!student || !student.batch) {
      return res.status(404).json({
        success: false,
        message: "Student batch information not found",
      });
    }

    const batchId = student.batch._id;
    const today = getISTDayName();
    const currentDate = getISTDateString();

    // Get today's timetable
    const timetable = await Timetable.findOne({
      batch: batchId,
      day: today,
    }).populate('classes.teacher', 'name');

    if (!timetable || !timetable.classes.length) {
      return res.status(200).json({
        success: true,
        message: "No classes scheduled for today",
        data: {
          classes: [],
          batchId: batchId,
          date: currentDate,
        },
      });
    }

    // Get already marked attendance for today
    const markedAttendance = await Attendance.find({
      user: studentId,
      date: new Date(currentDate),
    });

    const markedSubjects = markedAttendance.map(a => a.subject);

    // Filter out already marked subjects
    const availableClasses = timetable.classes
      .filter(classItem => !markedSubjects.includes(classItem.subject))
      .map(classItem => ({
        subject: classItem.subject,
        teacher: classItem.teacher,
        startTime: classItem.startTime,
        endTime: classItem.endTime,
        classroom: classItem.classroom,
      }));

    res.status(200).json({
      success: true,
      message: "Available classes fetched successfully",
      data: {
        classes: availableClasses,
        batchId: batchId,
        date: currentDate,
        totalClasses: timetable.classes.length,
        markedCount: markedSubjects.length,
      },
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch today's classes",
    });
  }
};