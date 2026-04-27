import * as timetableService from "../services/timetable.service.js";
import Timetable from "../models/timetable.model.js";
import Batch from "../models/batch.model.js";
import { getISTDayName, timeToMinutes, getISTTimeString, getISTDateString } from "../utils/timezone.js";


export const createTimetable = async (req, res) => {
  try {
    const { batch, day, classes, classTeacher } = req.body;

    // Validate required fields
    if (!batch || !day || !classes || !Array.isArray(classes) || classes.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Batch, day, and classes array are required",
      });
    }

    // Validate each class has required fields
    for (const classItem of classes) {
      if (!classItem.subject || !classItem.teacher || !classItem.startTime || !classItem.endTime || classItem.startTime >= classItem.endTime) {
        return res.status(400).json({
          success: false,
          message: "Each class must have subject, teacher, startTime, and endTime",
        });
      }
    }

    const timetable = await timetableService.createTimetable(req.body);

    res.status(201).json({
      success: true,
      message: "Timetable created successfully",
      data: timetable,
    });
  } catch (error) {res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create timetable",
    });
  }
};

// Get all timetable entries
 
export const getAllTimetables = async (req, res) => {
  try {
    const filters = {
      batch: req.query.batch,
      teacher: req.query.teacher,
      day: req.query.day,
    };

    const timetables = await timetableService.getAllTimetables(filters);

    res.status(200).json({
      success: true,
      count: timetables.length,
      data: timetables,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch timetables",
    });
  }
};

// Get timetable by ID

export const getTimetableById = async (req, res) => {
  try {
    const { id } = req.params;

    const timetable = await timetableService.getTimetableById(id);

    res.status(200).json({
      success: true,
      data: timetable,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch timetable",
    });
  }
};

// Get weekly timetable for a batch

export const getWeeklyTimetable = async (req, res) => {
  try {
    const { batchId } = req.params;

    const weeklyTimetable = await timetableService.getWeeklyTimetable(batchId);

    res.status(200).json({
      success: true,
      data: [weeklyTimetable], // Wrap in array as frontend expects timetables[0]
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch weekly timetable",
    });
  }
};

// Get teacher's timetable

export const getTeacherTimetable = async (req, res) => {
  try {
    // Use teacherId from params if provided, otherwise use authenticated user's ID
    const teacherId = req.params.teacherId || req.user.id;
    const { day } = req.query;

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: "Teacher ID is required",
      });
    }

    const timetable = await timetableService.getTeacherTimetable(teacherId, day);

    res.status(200).json({
      success: true,
      count: timetable.classes ? timetable.classes.length : 0,
      data: [timetable], // Wrap in array as frontend expects timetables[0]
    });
  } catch (error) {res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch teacher timetable",
    });
  }
};

//  Update timetable

export const updateTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const timetable = await timetableService.updateTimetable(id, updates);

    res.status(200).json({
      success: true,
      message: "Timetable updated successfully",
      data: timetable,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update timetable",
    });
  }
};

// Delete timetable

export const deleteTimetable = async (req, res) => {
  try {
    const { id } = req.params;

    await timetableService.deleteTimetable(id);

    res.status(200).json({
      success: true,
      message: "Timetable deleted successfully",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to delete timetable",
    });
  }
};

// Get free periods for a batch

export const getFreePeriods = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { day } = req.query;

    if (!day) {
      return res.status(400).json({
        success: false,
        message: "Day is required",
      });
    }

    const freePeriods = await timetableService.getFreePeriods(batchId, day);

    res.status(200).json({
      success: true,
      data: freePeriods,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch free periods",
    });
  }
};

// Get today's timetable

export const getTodayTimetable = async (req, res) => {
  try {
    const { batchId } = req.params;

    const todayTimetable = await timetableService.getTodayTimetable(batchId);

    res.status(200).json({
      success: true,
      count: todayTimetable.length,
      data: todayTimetable,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch today's timetable",
    });
  }
};

// Add class to timetable

export const addClassToTimetable = async (req, res) => {
  try {
    const classData = req.body;

    const timetable = await timetableService.addClassToTimetable(classData);

    res.status(201).json({
      success: true,
      message: "Class added to timetable successfully",
      data: timetable,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to add class to timetable",
    });
  }
};

// Remove class from timetable

export const removeClassFromTimetable = async (req, res) => {
  try {
    const { timetableId } = req.params;

    await timetableService.removeClassFromTimetable(timetableId);

    res.status(200).json({
      success: true,
      message: "Class removed from timetable successfully",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to remove class from timetable",
    });
  }
};

// Get timetable statistics

export const getTimetableStatistics = async (req, res) => {
  try {
    const { batchId } = req.query;

    const statistics = await timetableService.getTimetableStatistics(batchId);

    res.status(200).json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch timetable statistics",
    });
  }
};

/**
 * Get teacher's current class for QR generation
 * This checks if teacher has a class scheduled right now
 */
export const getTeacherCurrentClass = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const now = new Date();
    const currentDay = getISTDayName();
    // Use IST time instead of server local time
    const currentTime = getISTTimeString(); 
    const currentMinutes = timeToMinutes(currentTime);

    // Get today's timetables for this teacher with batch populated
    const timetables = await Timetable.find({
      day: currentDay,
      "classes.teacher": teacherId
    }).populate('batch', 'name department year');
    
    let currentClass = null;

    // Check each timetable for teacher's current class
    for (const timetable of timetables) {
      for (const classItem of timetable.classes) {
        if (classItem.teacher.toString() === teacherId) {
          const startMinutes = timeToMinutes(classItem.startTime);
          const endMinutes = timeToMinutes(classItem.endTime);
          
          // Check if current time is within class duration (with 10 min buffer before)
          if (currentMinutes >= (startMinutes - 10) && currentMinutes <= endMinutes) {
            currentClass = {
              timetableId: timetable._id,
              batch: timetable.batch,
              subject: classItem.subject,
              startTime: classItem.startTime,
              endTime: classItem.endTime,
              room: classItem.room || 'TBA',
              day: currentDay,
              date: getISTDateString()
            };
            break;
          }
        }
      }
      if (currentClass) break;
    }

    if (!currentClass) {
      return res.status(404).json({
        success: false,
        message: "No current class found. You can only generate QR codes during your scheduled class time.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Current class found",
      data: currentClass,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to get current class",
    });
  }
};

// Get teacher's today schedule
 
export const getTeacherTodaySchedule = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const today = getISTDayName();

    const classes = await timetableService.getTeacherTimetable(teacherId, today);

    res.status(200).json({
      success: true,
      message: "Today's schedule fetched successfully",
      data: {
        day: today,
        classes: classes,
        totalClasses: classes.length
      },
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch today's schedule",
    });
  }
};

// Get subjects for a batch
export const getBatchSubjects = async (req, res) => {
  try {
    const { batchId } = req.params;
    const userId = req.user.id;

    // Get all timetables for this batch
    const timetables = await Timetable.find({ batch: batchId })
      .populate('classes.teacher', 'name email');

    if (!timetables || timetables.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No timetable found for this batch",
      });
    }

    // Extract unique subjects (case-insensitive)
    const subjectsMap = new Map();
    
    timetables.forEach(timetable => {
      timetable.classes.forEach(classItem => {
        // Use lowercase for comparison to avoid duplicates
        const subjectKey = classItem.subject.toLowerCase();
        if (!subjectsMap.has(subjectKey)) {
          subjectsMap.set(subjectKey, {
            name: classItem.subject,
            teacherId: classItem.teacher._id,
            teacherName: classItem.teacher.name,
            teacherEmail: classItem.teacher.email,
          });
        }
      });
    });

    const subjects = Array.from(subjectsMap.values());

    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch batch subjects",
    });
  }
};
