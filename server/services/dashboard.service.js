import mongoose from "mongoose";
import User from "../models/user.model.js";
import Batch from "../models/batch.model.js";
import Attendance from "../models/attendance.model.js";
import Timetable from "../models/timetable.model.js";
import Notification from "../models/notification.model.js";
import Recommendation from "../models/recommendations.model.js";
import { getISTTimeString, getISTDateString, getISTDayName, getISTDayBounds } from "../utils/timezone.js";

// Get admin dashboard statistics

export const getAdminDashboardStats = async () => {
  const today = getISTDateString();
  const { startOfDay, endOfDay } = getISTDayBounds();

  // User statistics
  const totalUsers = await User.countDocuments();
  const totalStudents = await User.countDocuments({ role: "Student" });
  const totalTeachers = await User.countDocuments({ role: "Teacher" });
  const totalAdmins = await User.countDocuments({ role: "Admin" });

  // Batch statistics
  const totalBatches = await Batch.countDocuments();
  const activeBatches = await Batch.countDocuments({ status: "Active" });

  // Today's classes from timetable
  const currentDay = getISTDayName();
  const todayClasses = await Timetable.aggregate([
    {
      $match: {
        day: currentDay,
        classes: { $exists: true, $ne: [] }
      }
    },
    {
      $unwind: "$classes"
    },
    {
      $lookup: {
        from: "batches",
        localField: "batch",
        foreignField: "_id",
        as: "batchInfo"
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "classes.teacher",
        foreignField: "_id",
        as: "teacherInfo"
      }
    },
    {
      $project: {
        subject: "$classes.subject",
        startTime: "$classes.startTime",
        endTime: "$classes.endTime",
        room: "$classes.room",
        batch: { $arrayElemAt: ["$batchInfo", 0] },
        teacher: { $arrayElemAt: ["$teacherInfo", 0] }
      }
    }
  ]);

  // Count currently active classes (based on time)
  const currentTime = getISTTimeString();
  const [currentHour, currentMinute] = currentTime.split(':').map(Number);
  const currentMinutes = currentHour * 60 + currentMinute;
  
  const activeClasses = todayClasses.filter(classItem => {
    try {
      if (!classItem.startTime || !classItem.endTime) return false;
      const [startHour, startMinute] = classItem.startTime.split(':').map(Number);
      const [endHour, endMinute] = classItem.endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;
      
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    } catch (error) {return false;
    }
  });

  // Attendance statistics (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const attendanceTrends = await Attendance.aggregate([
    {
      $match: {
        markedAt: { $gte: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$markedAt" },
        },
        present: {
          $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] },
        },
        absent: {
          $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] },
        },
        total: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Today's attendance
  const todayAttendance = await Attendance.countDocuments({
    markedAt: { $gte: startOfDay, $lte: endOfDay },
  });

  const todayPresent = await Attendance.countDocuments({
    markedAt: { $gte: startOfDay, $lte: endOfDay },
    status: "Present",
  });

  // Recent notifications
  const recentNotifications = await Notification.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("sender", "name role");

  return {
    users: {
      total: totalUsers,
      students: totalStudents,
      teachers: totalTeachers,
      admins: totalAdmins,
    },
    batches: {
      total: totalBatches,
      active: activeBatches,
    },
    classes: {
      today: todayClasses.length,
      active: activeClasses.length,
      todayList: todayClasses,
    },
    attendance: {
      today: todayAttendance,
      todayPresent,
      todayPercentage: todayAttendance > 0 ? ((todayPresent / todayAttendance) * 100).toFixed(2) : 0,
      trends: attendanceTrends,
    },
    recentNotifications,
  };
};

// Get teacher dashboard statistics

export const getTeacherDashboardStats = async (teacherId) => {
  const today = getISTDateString();
  const currentDay = getISTDayName();

  // Today's classes from timetable
  const todayClasses = await Timetable.aggregate([
    {
      $match: {
        day: currentDay,
        "classes.teacher": new mongoose.Types.ObjectId(teacherId)
      }
    },
    {
      $unwind: "$classes"
    },
    {
      $match: {
        "classes.teacher": new mongoose.Types.ObjectId(teacherId)
      }
    },
    {
      $lookup: {
        from: "batches",
        localField: "batch",
        foreignField: "_id",
        as: "batchInfo"
      }
    },
    {
      $project: {
        _id: { $concat: [{ $toString: "$_id" }, "-", "$classes.subject"] },
        subject: "$classes.subject",
        startTime: "$classes.startTime",
        endTime: "$classes.endTime",
        room: "$classes.room",
        batch: { $arrayElemAt: ["$batchInfo", 0] }
      }
    },
    { $sort: { startTime: 1 } }
  ]);

  // Assigned batches (where teacher is class teacher)
  const assignedBatches = await Batch.find({ classTeacher: teacherId })
    .populate('classTeacher', 'name email')
    .populate('students', 'name email registrationNumber');

  // Total timetable entries for this teacher (across all days)
  const totalClasses = await Timetable.aggregate([
    {
      $match: {
        "classes.teacher": new mongoose.Types.ObjectId(teacherId)
      }
    },
    {
      $unwind: "$classes"
    },
    {
      $match: {
        "classes.teacher": new mongoose.Types.ObjectId(teacherId)
      }
    },
    {
      $count: "total"
    }
  ]);

  // Get unique subjects taught by this teacher
  const teacherSubjects = await Timetable.aggregate([
    {
      $match: {
        "classes.teacher": new mongoose.Types.ObjectId(teacherId)
      }
    },
    {
      $unwind: "$classes"
    },
    {
      $match: {
        "classes.teacher": new mongoose.Types.ObjectId(teacherId)
      }
    },
    {
      $group: {
        _id: "$classes.subject"
      }
    }
  ]);

  const subjectList = teacherSubjects.map(item => item._id);

  // Recent attendance for teacher's subjects
  const recentAttendance = await Attendance.find({
    subject: { $in: subjectList }
  })
    .populate("user", "name enrollmentNumber")
    .populate("batch", "name")
    .sort({ markedAt: -1 })
    .limit(20);

  return {
    batches: {
      total: assignedBatches.length,
      assigned: assignedBatches.length
    },
    students: {
      total: assignedBatches.reduce((sum, batch) => sum + (batch.students?.length || 0), 0)
    },
    todayClasses: {
      total: todayClasses.length,
      classes: todayClasses,
    },
    statistics: {
      totalClasses: totalClasses.length > 0 ? totalClasses[0].total : 0,
      assignedBatches: assignedBatches.length,
      subjectsTeaching: subjectList.length,
    },
    assignedBatches,
    recentAttendance,
    attendance: {
      percentage: 0, // Calculate if needed
      todayClasses: todayClasses
    }
  };
};


// Get student dashboard statistics

export const getStudentDashboardStats = async (studentId) => {
  const today = getISTDateString();
  const currentDay = getISTDayName();
  const { startOfDay, endOfDay } = getISTDayBounds();

  // Get student info with batch
  const student = await User.findById(studentId).populate("batch", "name department year");

  if (!student || !student.batch) {
    throw new Error("Student not found or not assigned to a batch");
  }

  // Today's schedule
  const todayTimetable = await Timetable.findOne({
    batch: student.batch._id,
    day: currentDay,
  }).populate('classes.teacher', 'name');

  const todayClasses = todayTimetable ? 
    todayTimetable.classes.map((classItem, index) => ({
      id: `${todayTimetable._id}-${index}`,
      subject: classItem.subject,
      teacher: classItem.teacher?.name || 'TBD',
      startTime: classItem.startTime,
      endTime: classItem.endTime,
      room: classItem.room || 'TBD'
    })) : [];

  // Attendance statistics (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const attendanceRecords = await Attendance.find({
    user: studentId,
    markedAt: { $gte: thirtyDaysAgo },
  });

  const totalClasses = attendanceRecords.length;
  const presentCount = attendanceRecords.filter((a) => a.status === "Present").length;
  const attendancePercentage = totalClasses > 0 ? ((presentCount / totalClasses) * 100).toFixed(2) : 0;

  // This week's attendance (last 7 days using IST)
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const thisWeekAttendance = [];

  for (let i = 0; i < 7; i++) {
    // Calculate IST date for each day
    const istDate = new Date();
    istDate.setDate(istDate.getDate() - i);
    const dateString = getISTDateString(istDate);
    
    const dayDate = new Date(dateString);
    const dayName = weekDays[dayDate.getDay() === 0 ? 6 : dayDate.getDay() - 1];
    
    const dayAttendance = await Attendance.findOne({
      user: studentId,
      markedAt: {
        $gte: new Date(dateString + 'T00:00:00.000Z'),
        $lt: new Date(dateString + 'T23:59:59.999Z')
      }
    });

    thisWeekAttendance.unshift({
      day: dayName.substr(0, 3),
      date: dayDate.getDate(),
      status: dayAttendance?.status || 'Absent',
      isToday: i === 0
    });
  }

  // Attendance trend (last 30 days)
  const attendanceTrend = await Attendance.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(studentId),
        markedAt: { $gte: thirtyDaysAgo },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$markedAt" },
        },
        present: {
          $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] },
        },
        total: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Pending recommendations
  const pendingRecommendations = await Recommendation.find({
    user: studentId,
    status: { $in: ["pending", "in-progress"] },
  })
    .sort({ priority: -1, createdAt: -1 })
    .limit(10);

  // Unread notifications
  const unreadNotifications = await Notification.countDocuments({
    recipients: studentId,
    "readBy.user": { $ne: studentId },
  });

  // Recent notifications
  const recentNotifications = await Notification.getUserNotifications(studentId, {
    limit: 5,
    sort: { createdAt: -1 },
  });

  return {
    student: {
      id: student._id,
      name: student.name,
      email: student.email,
      enrollmentNumber: student.enrollmentNumber,
      batch: student.batch,
    },
    batch: {
      name: student.batch?.name || 'N/A',
      currentSemester: student.batch?.semester || 'N/A'
    },
    sessions: {
      total: totalClasses,
      attended: presentCount,
      missed: totalClasses - presentCount
    },
    attendance: {
      totalClasses,
      present: presentCount,
      absent: totalClasses - presentCount,
      percentage: parseFloat(attendancePercentage),
    },
    attendanceRate: parseFloat(attendancePercentage),
    upcomingClasses: todayClasses, // Match frontend expectation
    thisWeekAttendance: thisWeekAttendance,
    recommendations: {
      pending: pendingRecommendations.length,
      list: pendingRecommendations,
    },
    recentNotifications: recentNotifications || [],
    notifications: {
      unread: unreadNotifications,
      recent: recentNotifications,
    },
  };
};

/**
 * Get system-wide statistics
 * @returns {Promise<Object>} System statistics
 */
export const getSystemStats = async () => {
  // Overall counts
  const totalUsers = await User.countDocuments();
  const totalBatches = await Batch.countDocuments();
  const totalTimetables = await Timetable.countDocuments();
  const totalAttendance = await Attendance.countDocuments();
  const totalNotifications = await Notification.countDocuments();
  const totalRecommendations = await Recommendation.countDocuments();

  // User breakdown by role
  const usersByRole = await User.aggregate([
    { $group: { _id: "$role", count: { $sum: 1 } } },
  ]);

  // Attendance by method
  const attendanceByMethod = await Attendance.aggregate([
    { $group: { _id: "$method", count: { $sum: 1 } } },
  ]);

  // Attendance by status
  const attendanceByStatus = await Attendance.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  // Overall attendance percentage
  const totalPresent = await Attendance.countDocuments({ status: "Present" });
  const overallAttendancePercentage = totalAttendance > 0 ? ((totalPresent / totalAttendance) * 100).toFixed(2) : 0;

  return {
    overview: {
      totalUsers,
      totalBatches,
      totalTimetables,
      totalAttendance,
      totalNotifications,
      totalRecommendations,
      overallAttendancePercentage,
    },
    usersByRole: usersByRole.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    attendanceByMethod: attendanceByMethod.reduce((acc, item) => {
      acc[item._id || "Unknown"] = item.count;
      return acc;
    }, {}),
    attendanceByStatus: attendanceByStatus.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
  };
};

// Get batch-specific dashboard statistics

export const getBatchDashboardStats = async (batchId) => {
  const batch = await Batch.findById(batchId).populate("students", "name email enrollmentNumber").populate("classTeacher", "name email");

  if (!batch) {
    throw new Error("Batch not found");
  }

  const today = getISTDateString();
  const currentDay = getISTDayName();

  // Today's classes for this batch
  const todayClasses = await Timetable.aggregate([
    {
      $match: {
        batch: new mongoose.Types.ObjectId(batchId),
        day: currentDay,
        classes: { $exists: true, $ne: [] }
      }
    },
    {
      $unwind: "$classes"
    },
    {
      $lookup: {
        from: "users",
        localField: "classes.teacher",
        foreignField: "_id",
        as: "teacherInfo"
      }
    },
    {
      $project: {
        subject: "$classes.subject",
        startTime: "$classes.startTime",
        endTime: "$classes.endTime",
        room: "$classes.room",
        teacher: { $arrayElemAt: ["$teacherInfo", 0] }
      }
    }
  ]);

  // Total timetable entries for this batch
  const batchTimetableData = await Timetable.find({ batch: batchId });
  const totalWeeklyClasses = batchTimetableData.reduce((total, timetable) => {
    return total + (timetable.classes ? timetable.classes.length : 0);
  }, 0);

  // Attendance statistics
  const totalAttendance = await Attendance.countDocuments({ batch: batchId });
  const totalPresent = await Attendance.countDocuments({
    batch: batchId,
    status: "Present",
  });

  const attendancePercentage = totalAttendance > 0 ? ((totalPresent / totalAttendance) * 100).toFixed(2) : 0;

  // Student attendance breakdown
  const studentAttendance = await Promise.all(
    batch.students.map(async (student) => {
      const studentTotal = await Attendance.countDocuments({
        user: student._id,
        batch: batchId,
      });
      const studentPresent = await Attendance.countDocuments({
        user: student._id,
        batch: batchId,
        status: "Present",
      });
      const studentPercentage = studentTotal > 0 ? ((studentPresent / studentTotal) * 100).toFixed(2) : 0;

      return {
        student: {
          id: student._id,
          name: student.name,
          enrollmentNumber: student.enrollmentNumber,
        },
        totalClasses: studentTotal,
        present: studentPresent,
        percentage: studentPercentage,
      };
    })
  );

  // Weekly timetable
  const weeklyTimetable = await Timetable.find({ batch: batchId }).sort({ day: 1 });

  return {
    batch: {
      id: batch._id,
      name: batch.name,
      department: batch.department,
      year: batch.year,
      totalStudents: batch.students.length,
      capacity: batch.capacity,
      classTeacher: batch.classTeacher,
    },
    todayClasses: {
      total: todayClasses.length,
      classes: todayClasses,
    },
    statistics: {
      totalWeeklyClasses,
      totalAttendance,
      totalPresent,
      attendancePercentage,
    },
    studentAttendance: studentAttendance.sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage)),
    weeklyTimetable,
  };
};

export default {
  getAdminDashboardStats,
  getTeacherDashboardStats,
  getStudentDashboardStats,
  getSystemStats,
  getBatchDashboardStats,
};
