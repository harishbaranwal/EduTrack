import Timetable from "../models/timetable.model.js";
import Batch from "../models/batch.model.js";
import { getISTDayName, timeToMinutes, calculateDuration as calcDuration } from "../utils/timezone.js";

// Create a new timetable
 
export const createTimetable = async (timetableData) => {
  // Validate that batch exists
  const batch = await Batch.findById(timetableData.batch);
  if (!batch) {
    throw new Error("Batch not found");
  }

  // Check for duplicate timetable (same batch and day)
  const existing = await Timetable.findOne({
    batch: timetableData.batch,
    day: timetableData.day,
  });

  if (existing) {
    throw new Error(`Timetable already exists for ${timetableData.day} in this batch`);
  }

  const timetable = await Timetable.create(timetableData);

  return await Timetable.findById(timetable._id)
    .populate("batch", "name department year")
    .populate("classTeacher", "name email")
    .populate("classes.teacher", "name email");
};

// Get all timetables with filters

export const getAllTimetables = async (filters = {}) => {
  const query = {};

  if (filters.batchId) {
    query.batch = filters.batchId;
  }

  if (filters.day) {
    query.day = filters.day;
  }

  const timetables = await Timetable.find(query)
    .sort({ day: 1 })
    .populate("batch", "name department year")
    .populate("classTeacher", "name email")
    .populate("classes.teacher", "name email");

  return timetables;
};

// Get timetable by ID
 
export const getTimetableById = async (timetableId) => {
  const timetable = await Timetable.findById(timetableId)
    .populate("batch", "name department year students")
    .populate("classTeacher", "name email")
    .populate("classes.teacher", "name email");

  if (!timetable) {
    throw new Error("Timetable not found");
  }

  return timetable;
};

// Get weekly timetable for a batch

export const getWeeklyTimetable = async (batchId) => {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const timetables = await Timetable.find({ batch: batchId })
    .sort({ day: 1 })
    .populate("batch", "name department year")
    .populate("classes.teacher", "name email");

  // Consolidate all classes with dayOfWeek field
  const allClasses = [];
  timetables.forEach((timetable) => {
    timetable.classes.forEach((classItem) => {
      allClasses.push({
        ...classItem.toObject(),
        dayOfWeek: timetable.day,
        day: timetable.day,
        batch: timetable.batch,
      });
    });
  });

  // Return in format expected by frontend: single object with all classes
  return {
    _id: batchId,
    batch: timetables[0]?.batch || null,
    classes: allClasses,
    createdAt: timetables[0]?.createdAt || new Date(),
    updatedAt: timetables[0]?.updatedAt || new Date(),
  };
};

// Get timetable for a teacher
 
export const getTeacherTimetable = async (teacherId, day = null) => {
  const query = { "classes.teacher": teacherId };

  if (day) {
    query.day = day;
  }

  const timetables = await Timetable.find(query)
    .populate("batch", "name department year")
    .populate("classes.teacher", "name email");

  // Filter classes to show only teacher's classes and format for frontend
  const teacherClasses = [];

  timetables.forEach((timetable) => {
    timetable.classes.forEach((classItem) => {
      if (classItem.teacher && classItem.teacher._id.toString() === teacherId.toString()) {
        teacherClasses.push({
          dayOfWeek: timetable.day,
          day: timetable.day,
          batch: timetable.batch,
          ...classItem.toObject(),
        });
      }
    });
  });

  // Return in the format expected by frontend: { classes: [...] }
  return {
    classes: teacherClasses,
    _id: 'teacher-timetable',
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

//  Update timetable
 
export const updateTimetable = async (timetableId, updateData) => {
  const timetable = await Timetable.findByIdAndUpdate(timetableId, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("batch", "name department year")
    .populate("classTeacher", "name email")
    .populate("classes.teacher", "name email");

  if (!timetable) {
    throw new Error("Timetable not found");
  }

  return timetable;
};

//  Delete timetable
 
export const deleteTimetable = async (timetableId) => {
  const timetable = await Timetable.findByIdAndDelete(timetableId);

  if (!timetable) {
    throw new Error("Timetable not found");
  }

  return timetable;
};

// Calculate free periods in a day's schedule

export const calculateFreePeriods = (classes) => {
  if (!classes || classes.length === 0) {
    return [];
  }

  // Sort classes by start time
  const sortedClasses = [...classes].sort((a, b) => {
    const timeA = timeToMinutes(a.startTime);
    const timeB = timeToMinutes(b.startTime);
    return timeA - timeB;
  });

  const freePeriods = [];

  // Check gaps between consecutive classes
  for (let i = 0; i < sortedClasses.length - 1; i++) {
    const currentEnd = sortedClasses[i].endTime;
    const nextStart = sortedClasses[i + 1].startTime;

    const endMinutes = timeToMinutes(currentEnd);
    const startMinutes = timeToMinutes(nextStart);
    const gap = startMinutes - endMinutes;

    // If gap is more than 10 minutes, consider it a free period
    if (gap > 10) {
      freePeriods.push({
        startTime: currentEnd,
        endTime: nextStart,
        duration: gap,
        afterClass: sortedClasses[i].subject,
        beforeClass: sortedClasses[i + 1].subject,
      });
    }
  }

  return freePeriods;
};

// Get free periods for a batch on a specific day

export const getFreePeriods = async (batchId, day) => {
  const timetable = await Timetable.findOne({ batch: batchId, day });

  if (!timetable) {
    throw new Error("Timetable not found for this day");
  }

  const freePeriods = calculateFreePeriods(timetable.classes);

  return {
    day,
    batch: batchId,
    totalClasses: timetable.classes.length,
    freePeriods,
    totalFreePeriods: freePeriods.length,
    totalFreeTime: freePeriods.reduce((sum, period) => sum + period.duration, 0),
  };
};

// Get today's timetable for a batch


export const getTodayTimetable = async (batchId) => {
  const today = getISTDayName();

  const timetable = await Timetable.findOne({ batch: batchId, day: today })
    .populate("batch", "name department year")
    .populate("classTeacher", "name email")
    .populate("classes.teacher", "name email");

  if (!timetable) {
    return {
      day: today,
      message: "No classes scheduled for today",
      classes: [],
    };
  }

  return timetable;
};

// Add class to timetable

export const addClassToTimetable = async (timetableId, classData) => {
  const timetable = await Timetable.findById(timetableId);

  if (!timetable) {
    throw new Error("Timetable not found");
  }

  // Check for time conflicts
  const hasConflict = timetable.classes.some((existingClass) => {
    const existingStart = timeToMinutes(existingClass.startTime);
    const existingEnd = timeToMinutes(existingClass.endTime);
    const newStart = timeToMinutes(classData.startTime);
    const newEnd = timeToMinutes(classData.endTime);

    return (
      (newStart >= existingStart && newStart < existingEnd) || (newEnd > existingStart && newEnd <= existingEnd) ||
      (newStart <= existingStart && newEnd >= existingEnd)
    );
  });

  if (hasConflict) {
    throw new Error("Time conflict with existing class");
  }

  timetable.classes.push(classData);
  await timetable.save();

  return await Timetable.findById(timetable._id)
    .populate("batch", "name department year")
    .populate("classTeacher", "name email")
    .populate("classes.teacher", "name email");
};

// Remove class from timetable
 
export const removeClassFromTimetable = async (timetableId, classId) => {
  const timetable = await Timetable.findById(timetableId);

  if (!timetable) {
    throw new Error("Timetable not found");
  }

  const classIndex = timetable.classes.findIndex((c) => c._id.toString() === classId.toString());

  if (classIndex === -1) {
    throw new Error("Class not found in timetable");
  }

  timetable.classes.splice(classIndex, 1);
  await timetable.save();

  return await Timetable.findById(timetable._id).populate("batch", "name department year");
};

// Get timetable statistics

export const getTimetableStatistics = async (batchId = null) => {
  const query = batchId ? { batch: batchId } : {};

  const timetables = await Timetable.find(query);

  let totalClasses = 0;
  let totalHours = 0;

  timetables.forEach((timetable) => {
    totalClasses += timetable.classes.length;

    timetable.classes.forEach((classItem) => {
      const duration = calcDuration(classItem.startTime, classItem.endTime);
      totalHours += duration / 60; // Convert minutes to hours
    });
  });

  return {
    totalTimetables: timetables.length,
    totalClasses,
    totalHours: totalHours.toFixed(2),
    averageClassesPerDay: timetables.length > 0 ? (totalClasses / timetables.length).toFixed(2) : 0,
  };
};

export default {
  createTimetable,
  getAllTimetables,
  getTimetableById,
  getWeeklyTimetable,
  getTeacherTimetable,
  updateTimetable,
  deleteTimetable,
  calculateFreePeriods,
  getFreePeriods,
  getTodayTimetable,
  addClassToTimetable,
  removeClassFromTimetable,
  getTimetableStatistics,
};
