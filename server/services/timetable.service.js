import Timetable from "../models/timetable.model.js";
import Batch from "../models/batch.model.js";
import User from "../models/user.model.js";
import { getISTDayName, timeToMinutes, calculateDuration as calcDuration } from "../utils/timezone.js";

// Helper: Check time overlap between two intervals
const hasTimeOverlap = (start1, end1, start2, end2) => {
  return (
    (start1 >= start2 && start1 < end2) ||
    (end1 > start2 && end1 <= end2) ||
    (start1 <= start2 && end1 >= end2)
  );
};

// Helper: Resolve teacher ID from various formats
const resolveTeacherId = (teacher) => {
  if (!teacher) return null;
  if (typeof teacher === 'object') return teacher._id?.toString() || teacher.toString();
  return teacher.toString();
};

// Helper: Check if a teacher has conflicting classes on the same day across ALL timetables
// Also checks for intra-submission conflicts (same teacher at overlapping times within the submitted classes)
const checkTeacherConflicts = async (day, classes, excludeTimetableId = null) => {
  // --- Step 1: Check intra-submission conflicts ---
  // If the same teacher appears multiple times in the submitted classes, check for overlaps among them
  for (let i = 0; i < classes.length; i++) {
    const teacherIdA = resolveTeacherId(classes[i].teacher);
    if (!teacherIdA) continue;
    const startA = timeToMinutes(classes[i].startTime);
    const endA = timeToMinutes(classes[i].endTime);

    for (let j = i + 1; j < classes.length; j++) {
      const teacherIdB = resolveTeacherId(classes[j].teacher);
      if (teacherIdA !== teacherIdB) continue;

      const startB = timeToMinutes(classes[j].startTime);
      const endB = timeToMinutes(classes[j].endTime);

      if (hasTimeOverlap(startA, endA, startB, endB)) {
        const teacherName = (await User.findById(teacherIdA).select('name'))?.name || 'Unknown';
        throw new Error(
          `Scheduling conflict: Teacher "${teacherName}" is assigned to both "${classes[i].subject}" (${classes[i].startTime}–${classes[i].endTime}) and "${classes[j].subject}" (${classes[j].startTime}–${classes[j].endTime}) on ${day}. A teacher cannot teach two classes at the same time.`
        );
      }
    }
  }

  // --- Step 2: Check cross-batch conflicts against existing timetables in the DB ---
  const query = { day };
  if (excludeTimetableId) {
    query._id = { $ne: excludeTimetableId };
  }

  const existingTimetables = await Timetable.find(query)
    .populate('batch', 'name')
    .populate('classes.teacher', 'name');

  for (const newClass of classes) {
    const newStart = timeToMinutes(newClass.startTime);
    const newEnd = timeToMinutes(newClass.endTime);
    const teacherId = resolveTeacherId(newClass.teacher);

    if (!teacherId) continue;

    for (const tt of existingTimetables) {
      for (const existingClass of tt.classes) {
        const existingTeacherId = resolveTeacherId(existingClass.teacher);

        if (existingTeacherId !== teacherId) continue;

        const existingStart = timeToMinutes(existingClass.startTime);
        const existingEnd = timeToMinutes(existingClass.endTime);

        if (hasTimeOverlap(newStart, newEnd, existingStart, existingEnd)) {
          const teacherName = typeof existingClass.teacher === 'object'
            ? existingClass.teacher.name
            : (await User.findById(teacherId).select('name'))?.name || 'Unknown';
          const batchName = typeof tt.batch === 'object' ? tt.batch.name : tt.batch;
          throw new Error(
            `Scheduling conflict: Teacher "${teacherName}" is already assigned to "${existingClass.subject}" in batch "${batchName}" on ${day} from ${existingClass.startTime} to ${existingClass.endTime}. The new class "${newClass.subject}" (${newClass.startTime}–${newClass.endTime}) overlaps with this. Please choose a different teacher or time slot.`
          );
        }
      }
    }
  }
};

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

  // Check for teacher conflicts across all batches on this day
  if (timetableData.classes && timetableData.classes.length > 0) {
    await checkTeacherConflicts(timetableData.day, timetableData.classes);
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
  // If classes are being updated, check for teacher conflicts
  if (updateData.classes && updateData.classes.length > 0) {
    const existingTimetable = await Timetable.findById(timetableId);
    if (!existingTimetable) {
      throw new Error("Timetable not found");
    }
    const day = updateData.day || existingTimetable.day;
    await checkTeacherConflicts(day, updateData.classes, timetableId);
  }

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
  const timetable = await Timetable.findById(timetableId)
    .populate('batch', 'name');

  if (!timetable) {
    throw new Error("Timetable not found");
  }

  const newStart = timeToMinutes(classData.startTime);
  const newEnd = timeToMinutes(classData.endTime);

  // Check for time slot conflicts within the same timetable (batch)
  const conflictingClass = timetable.classes.find((existingClass) => {
    const existingStart = timeToMinutes(existingClass.startTime);
    const existingEnd = timeToMinutes(existingClass.endTime);
    return hasTimeOverlap(newStart, newEnd, existingStart, existingEnd);
  });

  if (conflictingClass) {
    throw new Error(
      `Time slot conflict: The new class "${classData.subject}" (${classData.startTime}–${classData.endTime}) overlaps with "${conflictingClass.subject}" (${conflictingClass.startTime}–${conflictingClass.endTime}) in this timetable.`
    );
  }

  // Check for teacher conflicts across ALL batches on this day
  await checkTeacherConflicts(timetable.day, [classData], timetableId);

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
