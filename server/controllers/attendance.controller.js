import Attendance from "../models/attendance.model.js";
import Timetable from "../models/timetable.model.js";
import Batch from "../models/batch.model.js";
import User from "../models/user.model.js";
import { getISTDayName, timeToMinutes, getISTDateString } from "../utils/timezone.js";
import { calculateDistance } from "../services/attendance.service.js";

// Campus location constants
const CAMPUS_LOCATION = {
  latitude: parseFloat(process.env.CAMPUS_LATITUDE || '31.26234'),
  longitude: parseFloat(process.env.CAMPUS_LONGITUDE || '75.70266'),
};

const ALLOWED_RADIUS = parseFloat(process.env.ATTENDANCE_RADIUS || '100');

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
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: "QR code data is required",
      });
    }

    // Parse QR code data
    let qrInfo;
    try {
      qrInfo = JSON.parse(qrData);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid QR code format",
      });
    }

    const { timetableId, subject, teacherId, date, startTime, endTime, batchId } = qrInfo;

    // Verify student belongs to this batch
    const batch = await Batch.findById(batchId);
    if (!batch || !batch.students.includes(studentId)) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this batch",
      });
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
      method: "QR_Scan",
      markedBy: studentId,
    };

    const attendance = await createOrUpdateAttendance(attendanceData);
    await attendance.populate([
      { path: "user", select: "name email registrationNumber" },
      { path: "teacher", select: "name email" },
      { path: "batch", select: "name" }
    ]);

    res.status(200).json({
      success: true,
      message: "Attendance marked successfully via QR code",
      data: attendance,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to mark attendance",
    });
  }
};

// Mark attendance using location
export const markAttendanceByLocation = async (req, res) => {
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

    // Calculate distance from campus
    const distance = calculateDistance(
      parseFloat(latitude),
      parseFloat(longitude),
      CAMPUS_LOCATION.latitude,
      CAMPUS_LOCATION.longitude
    );

    // Check if student is within allowed radius
    if (distance > ALLOWED_RADIUS) {
      return res.status(400).json({
        success: false,
        message: `You are ${distance.toFixed(0)}m away from campus. You must be within ${ALLOWED_RADIUS}m to mark attendance.`,
        data: { distance, allowedRadius: ALLOWED_RADIUS }
      });
    }

    const currentDate = getISTDateString();

    // Check if attendance already exists
    const existingAttendance = await Attendance.findOne({
      user: studentId,
      subject: subject,
      date: new Date(currentDate),
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: "Attendance already marked for this subject today",
      });
    }

    // Get today's timetable
    const today = getISTDayName();
    const timetable = await Timetable.findOne({
      batch: batchId,
      day: today,
    });

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "No classes scheduled for today",
      });
    }

    const classInfo = timetable.classes.find(c => c.subject === subject);
    if (!classInfo) {
      return res.status(404).json({
        success: false,
        message: "Subject not found in today's timetable",
      });
    }

    // Create attendance record
    const attendanceData = {
      user: studentId,
      batch: batchId,
      timetable: timetable._id,
      subject: subject,
      teacher: classInfo.teacher,
      date: new Date(currentDate),
      classStartTime: classInfo.startTime,
      classEndTime: classInfo.endTime,
      status: "Present",
      method: "Location",
      markedBy: studentId,
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        distance: distance
      }
    };

    const attendance = await createOrUpdateAttendance(attendanceData);
    await attendance.populate([
      { path: "user", select: "name email registrationNumber" },
      { path: "teacher", select: "name email" },
      { path: "batch", select: "name" }
    ]);

    res.status(200).json({
      success: true,
      message: `Attendance marked successfully. Distance: ${distance.toFixed(1)}m from campus.`,
      data: attendance,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to mark attendance",
    });
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
    const { batchId, subject } = req.body;
    const teacherId = req.user.id;

    if (!batchId || !subject) {
      return res.status(400).json({
        success: false,
        message: "Batch ID and subject are required",
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
    const qrData = {
      timetableId: validation.timetable._id,
      subject: subject,
      teacherId: teacherId,
      date: currentDate,
      startTime: validation.classInfo.startTime,
      endTime: validation.classInfo.endTime,
      batchId: batchId,
      timestamp: Date.now(),
    };

    res.status(200).json({
      success: true,
      message: "QR data generated successfully",
      data: { qrData: JSON.stringify(qrData) },
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