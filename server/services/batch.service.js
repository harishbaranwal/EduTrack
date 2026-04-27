import Batch from "../models/batch.model.js";
import User from "../models/user.model.js";

// Create a new batch

export const createBatch = async (batchData) => {
  const batch = await Batch.create(batchData);
  return await Batch.findById(batch._id)
    .populate("students", "name email registrationNumber")
    .populate("classTeacher", "name email");
};

// Get all batches with filters

export const getAllBatches = async (filters = {}) => {
  const query = {};

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.department) {
    query.department = filters.department;
  }

  if (filters.year) {
    query.year = filters.year;
  }

  const batches = await Batch.find(query)
    .sort({ createdAt: -1 })
    .populate("students", "name email registrationNumber")
    .populate("classTeacher", "name email");

  return batches;
};

//  Get batch by ID

export const getBatchById = async (batchId) => {
  const batch = await Batch.findById(batchId)
    .populate("students", "name email registrationNumber role")
    .populate("classTeacher", "name email");

  if (!batch) {
    throw new Error("Batch not found");
  }

  return batch;
};

// Update batch

export const updateBatch = async (batchId, updateData) => {
  const batch = await Batch.findByIdAndUpdate(batchId, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("students", "name email registrationNumber")
    .populate("classTeacher", "name email");

  if (!batch) {
    throw new Error("Batch not found");
  }

  return batch;
};

// Delete batch

export const deleteBatch = async (batchId) => {
  const batch = await Batch.findByIdAndDelete(batchId);

  if (!batch) {
    throw new Error("Batch not found");
  }

  return batch;
};

// Add students to batch

export const addStudentsToBatch = async (batchId, studentIds) => {
  const batch = await Batch.findById(batchId);

  if (!batch) {
    throw new Error("Batch not found");
  }

  // Verify all users are students
  const students = await User.find({
    _id: { $in: studentIds },
    role: "Student",
  });

  if (students.length !== studentIds.length) {
    throw new Error("Some users are not students or do not exist");
  }

  // Check capacity
  const newTotal = batch.students.length + studentIds.length;
  if (newTotal > batch.capacity) {
    throw new Error(`Batch capacity exceeded. Maximum capacity: ${batch.capacity}`);
  }

  // Add students (avoid duplicates)
  const uniqueStudentIds = studentIds.filter(
    (id) => !batch.students.some((existingId) => existingId.toString() === id.toString())
  );

  batch.students.push(...uniqueStudentIds);

  // Update student's batch field
  await User.updateMany({ _id: { $in: uniqueStudentIds } }, { batch: batchId });

  await batch.save();

  return await Batch.findById(batch._id)
    .populate("students", "name email registrationNumber")
    .populate("classTeacher", "name email");
};

// Remove student from batch

export const removeStudentFromBatch = async (batchId, studentId) => {
  const batch = await Batch.findById(batchId);

  if (!batch) {
    throw new Error("Batch not found");
  }

  // Check if student exists in batch
  const studentIndex = batch.students.findIndex((id) => id.toString() === studentId.toString());

  if (studentIndex === -1) {
    throw new Error("Student not found in this batch");
  }

  // Remove student
  batch.students.splice(studentIndex, 1);

  // Update student's batch field
  await User.findByIdAndUpdate(studentId, { $unset: { batch: 1 } });

  await batch.save();

  return await Batch.findById(batch._id)
    .populate("students", "name email registrationNumber")
    .populate("classTeacher", "name email");
};

// Get batch statistics

export const getBatchStatistics = async (batchId) => {
  const batch = await Batch.findById(batchId).populate("students");

  if (!batch) {
    throw new Error("Batch not found");
  }

  const totalStudents = batch.students.length;
  const capacityUtilization = ((totalStudents / batch.capacity) * 100).toFixed(2);

  return {
    batchId: batch._id,
    batchName: batch.name,
    totalStudents,
    capacity: batch.capacity,
    capacityUtilization: `${capacityUtilization}%`,
    availableSeats: batch.capacity - totalStudents,
    department: batch.department,
    year: batch.year,
    status: batch.status,
    totalSubjects: batch.subjects ? batch.subjects.length : 0,
  };
};

//  Get students by batch
 
export const getStudentsByBatch = async (batchId) => {
  const batch = await Batch.findById(batchId).populate("students", "name email registrationNumber interests careerGoals strengths");

  if (!batch) {
    throw new Error("Batch not found");
  }

  return batch.students;
};

export default {
  createBatch,
  getAllBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
  addStudentsToBatch,
  removeStudentFromBatch,
  getBatchStatistics,
  getStudentsByBatch,
};