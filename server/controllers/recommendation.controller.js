import User from "../models/user.model.js";
import Timetable from "../models/timetable.model.js";
import Batch from "../models/batch.model.js";
import * as RecommendationService from "../services/recommendation.service.js";
import { getISTDayName, getISTTimeString } from "../utils/timezone.js";


export const createRecommendation = async (req, res) => {
  try {
    const { userId, title, description, category, priority, estimatedDuration, resources, relatedSubject } = req.body;

    if (!userId || !title || !description || !estimatedDuration) {
      return res.status(400).json({
        success: false,
        message: "User ID, title, description, and estimated duration are required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const recommendationData = {
      user: userId,
      title,
      description,
      category,
      priority,
      estimatedDuration,
      resources,
      relatedSubject,
    };

    const recommendation = await RecommendationService.createRecommendation(recommendationData);

    res.status(201).json({
      success: true,
      message: "Recommendation created successfully",
      data: recommendation,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create recommendation",
    });
  }
};

export const getFreePeriodRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    let { batchId, day, currentTime } = req.query;

    // Use IST day if not provided
    if (!day) {
      day = getISTDayName();
    }

    // Use IST current time if not provided
    if (!currentTime) {
      currentTime = getISTTimeString();
    }

    if (!batchId) {
      return res.status(400).json({
        success: false,
        message: "Batch ID is required",
      });
    }

    // Get user details with profile information
    const user = await User.findById(userId).select("name email interests careerGoals strengths batch");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get batch subjects
    const batch = await Batch.findById(batchId).select("subjects");
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }
    const batchSubjects = batch?.subjects || [];

    // Get timetable for the day
    const timetables = await Timetable.find({ batch: batchId, day });

    const allClasses = timetables.flatMap((t) => t.classes).sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Get today's classes with subject information
    const todayClasses = allClasses.map((classItem) => ({
      subject: classItem.subject,
      startTime: classItem.startTime,
      endTime: classItem.endTime,
    }));

    // Calculate free period duration
    const freePeriodDuration = RecommendationService.calculateFreePeriodDuration(allClasses, currentTime);

    // Generate personalized recommendations
    const recommendations = RecommendationService.generatePersonalizedRecommendations(
      user,
      freePeriodDuration,
      batchSubjects,
      todayClasses
    );

    return res.status(200).json({
      success: true,
      currentTime,
      day,
      freePeriodDuration,
      batchSubjects,
      todayClasses: todayClasses.map((c) => c.subject),
      recommendations,
    });
  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

export const getUserRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, category, relatedSubject } = req.query;

    const recommendations = await RecommendationService.getUserRecommendations(userId, {
      status,
      category,
      relatedSubject,
    });

    return res.status(200).json({
      success: true,
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

export const getRecommendationById = async (req, res) => {
  try {
    const { id } = req.params;

    const recommendation = await RecommendationService.getRecommendationById(id);

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: "Recommendation not found",
      });
    }

    return res.status(200).json({
      success: true,
      recommendation,
    });
  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};


export const updateRecommendationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const validStatuses = ["pending", "in-progress", "completed", "skipped"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: pending, in-progress, completed, skipped",
      });
    }

    const recommendation = await RecommendationService.updateRecommendationStatus(id, status, feedback);

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: "Recommendation not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Recommendation status updated successfully",
      recommendation,
    });
  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};


export const deleteRecommendation = async (req, res) => {
  try {
    const { id } = req.params;

    const recommendation = await RecommendationService.deleteRecommendation(id);

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: "Recommendation not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Recommendation deleted successfully",
    });
  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};


export const getRecommendationStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const stats = await RecommendationService.getRecommendationStatistics(userId);

    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

export const bulkCreateRecommendations = async (req, res) => {
  try {
    const { batchId, day, freePeriodStart, freePeriodEnd } = req.body;

    if (!batchId || !day || !freePeriodStart || !freePeriodEnd) {
      return res.status(400).json({
        success: false,
        message: "Batch ID, day, free period start and end times are required",
      });
    }

    // Calculate duration
    const duration = RecommendationService.calculateFreePeriodDuration([
      { startTime: freePeriodStart, endTime: freePeriodEnd },
    ]);

    // Get batch subjects
    const batch = await Batch.findById(batchId).select("subjects");
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }
    const batchSubjects = batch?.subjects || [];

    // Get timetable to find today's classes
    const timetables = await Timetable.find({ batch: batchId, day });
    const todayClasses = timetables
      .flatMap((t) => t.classes)
      .map((classItem) => ({
        subject: classItem.subject,
        startTime: classItem.startTime,
        endTime: classItem.endTime,
      }));

    // Get all students in the batch
    const students = await User.find({ batch: batchId, role: "Student" }).select(
      "name email interests careerGoals strengths"
    );

    const createdRecommendations = [];

    for (const student of students) {
      const recommendations = RecommendationService.generatePersonalizedRecommendations(
        student,
        duration,
        batchSubjects,
        todayClasses
      );

      // Create top 3 recommendations for each student
      for (const rec of recommendations.slice(0, 3)) {
        const recommendation = await RecommendationService.createRecommendation({
          user: student._id,
          ...rec,
        });
        createdRecommendations.push(recommendation);
      }
    }

    return res.status(201).json({
      success: true,
      message: `Created ${createdRecommendations.length} recommendations for ${students.length} students`,
      count: createdRecommendations.length,
    });
  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};


export const getCourseRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;

    const recommendations = await RecommendationService.generateCourseRecommendations(userId);

    res.status(200).json({
      success: true,
      message: "Course recommendations generated successfully",
      data: recommendations,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to generate course recommendations",
    });
  }
};

export default {
  createRecommendation,
  getFreePeriodRecommendations,
  getUserRecommendations,
  getRecommendationById,
  updateRecommendationStatus,
  deleteRecommendation,
  getRecommendationStats,
  bulkCreateRecommendations,
  getCourseRecommendations,
};
