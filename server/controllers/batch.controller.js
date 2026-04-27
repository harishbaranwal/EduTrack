import * as batchService from "../services/batch.service.js";
import Timetable from "../models/timetable.model.js";

// Create a new batch (Admin only)

export const createBatch = async (req, res) => {
  try {
    const batchData = req.body;

    if (!batchData.name || !batchData.department ) {
      return res.status(400).json({
        success: false,
        message: "Name and department are required",
      });
    }

    const batch = await batchService.createBatch(batchData);

    res.status(201).json({
      success: true,
      message: "Batch created successfully",
      data: batch,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create batch",
    });
  }
};

// Get all batches

export const getAllBatches = async (req, res) => {
  try {
    const filters = {
      department: req.query.department,
      year: req.query.year,
    };

    const batches = await batchService.getAllBatches(filters);

    res.status(200).json({
      success: true,
      count: batches.length,
      data: batches,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch batches",
    });
  }
};

// Get single batch by ID

export const getBatchById = async (req, res) => {
  try {
    const { id } = req.params;

    const batch = await batchService.getBatchById(id);

    res.status(200).json({
      success: true,
      data: batch,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch batch",
    });
  }
};

// Update batch

export const updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const batch = await batchService.updateBatch(id, updates);

    res.status(200).json({
      success: true,
      message: "Batch updated successfully",
      data: batch,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update batch",
    });
  }
};

// Delete batch

export const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;

    await batchService.deleteBatch(id);

    res.status(200).json({
      success: true,
      message: "Batch deleted successfully",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to delete batch",
    });
  }
};

// Add students to batch

export const addStudentsToBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentIds } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Student IDs array is required",
      });
    }

    const batch = await batchService.addStudentsToBatch(id, studentIds);

    res.status(200).json({
      success: true,
      message: "Students added successfully",
      data: batch,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to add students to batch",
    });
  }
};

// Remove student from batch

export const removeStudentFromBatch = async (req, res) => {
  try {
    const { id, studentId } = req.params;

    const batch = await batchService.removeStudentFromBatch(id, studentId);

    res.status(200).json({
      success: true,
      message: "Student removed successfully",
      data: batch,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to remove student from batch",
    });
  }
};

// Get batch statistics

export const getBatchStatistics = async (req, res) => {
  try {
    const { batchId } = req.params;

    const statistics = await batchService.getBatchStatistics(batchId);

    res.status(200).json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch batch statistics",
    });
  }
};

// Get students by batch

export const getStudentsByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;

    const students = await batchService.getStudentsByBatch(batchId);

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

// Get teacher's assigned batches
export const getTeacherBatches = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const userRole = req.user.role;

    let batches = [];

    if (userRole === 'Admin') {
      // Admin gets all batches
      const allBatches = await batchService.getAllBatches();
      batches = allBatches;
    } else {
      // Find all timetables where this teacher teaches
      const timetables = await Timetable.find({
        'classes.teacher': teacherId
      }).populate('batch', 'name capacity department year');
      // Extract unique batches
      const batchMap = new Map();
      timetables.forEach(timetable => {
        if (timetable.batch) {
          batchMap.set(timetable.batch._id.toString(), timetable.batch);
        }
      });

      batches = Array.from(batchMap.values());
    }

    res.status(200).json({
      success: true,
      count: batches.length,
      data: batches,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch teacher batches",
    });
  }
};
