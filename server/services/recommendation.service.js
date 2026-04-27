/**
 * Recommendation Service
 * Business logic for generating and managing personalized recommendations
 */

import mongoose from "mongoose";
import Recommendation from "../models/recommendations.model.js";
import User from "../models/user.model.js";
import Batch from "../models/batch.model.js";
import Timetable from "../models/timetable.model.js";
import { getCurrentISTTime, getISTDayName, timeToMinutes } from "../utils/timezone.js";
import { courseCatalog, careerToCourseMap, interestToCourseMap } from "../data/courseCatalog.js";

/**
 * Generate personalized recommendations based on user profile and classes
 * @param {Object} user - User object with interests, careerGoals, strengths
 * @param {Number} freePeriodDuration - Available time in minutes
 * @param {Array} batchSubjects - List of subjects in student's batch
 * @param {Array} todayClasses - Classes attended today
 * @returns {Array} Array of recommendation objects
 */
export const generatePersonalizedRecommendations = (
  user,
  freePeriodDuration,
  batchSubjects = [],
  todayClasses = []
) => {
  const recommendations = [];
  const addedRecommendations = new Set(); // Track added recommendations to avoid duplicates
  const { interests, careerGoals, strengths } = user;

  // Helper function to add unique recommendations
  const addRecommendation = (rec) => {
    const key = `${rec.title}-${rec.category}`;
    if (!addedRecommendations.has(key)) {
      addedRecommendations.add(key);
      recommendations.push(rec);
    }
  };

  // ==========================================
  // 1. CLASS-SPECIFIC ACADEMIC RECOMMENDATIONS
  // ==========================================

  // Recommendations for classes attended today
  if (todayClasses && todayClasses.length > 0) {
    todayClasses.slice(0, 2).forEach((classItem) => { // Limit to 2 classes
      addRecommendation({
        title: `Review ${classItem.subject} Class Notes`,
        description: `Go through today's ${classItem.subject} lecture (${classItem.startTime}-${classItem.endTime}) and make summary notes`,
        category: "academic",
        priority: "high",
        estimatedDuration: Math.min(freePeriodDuration, 30),
        resources: [],
        relatedSubject: classItem.subject,
      });

      addRecommendation({
        title: `Practice ${classItem.subject} Problems`,
        description: `Solve practice problems related to today's ${classItem.subject} concepts`,
        category: "academic",
        priority: "high",
        estimatedDuration: Math.min(freePeriodDuration, 45),
        resources: [],
        relatedSubject: classItem.subject,
      });
    });
  }

  // Recommendations for upcoming classes (only if not already covered by today's classes)
  const processedSubjects = new Set(todayClasses.map(c => c.subject));
  if (batchSubjects && batchSubjects.length > 0) {
    batchSubjects
      .filter(subject => !processedSubjects.has(subject))
      .slice(0, 2) // Limit to 2 upcoming subjects
      .forEach((subject) => {
        addRecommendation({
          title: `Prepare for ${subject}`,
          description: `Read ahead and prepare notes for upcoming ${subject} class`,
          category: "academic",
          priority: "medium",
          estimatedDuration: Math.min(freePeriodDuration, 40),
          resources: [],
          relatedSubject: subject,
        });

        addRecommendation({
          title: `${subject} Assignment Work`,
          description: `Work on pending ${subject} assignments or homework`,
          category: "academic",
          priority: "high",
          estimatedDuration: Math.min(freePeriodDuration, 50),
          resources: [],
          relatedSubject: subject,
        });
      });
  }

  // Subject-specific skill recommendations (only for subjects not already processed)
  const allProcessedSubjects = new Set([
    ...todayClasses.map(c => c.subject),
    ...batchSubjects.filter(subject => !processedSubjects.has(subject)).slice(0, 2)
  ]);

  if (batchSubjects && batchSubjects.length > 0) {
    batchSubjects
      .filter(subject => !allProcessedSubjects.has(subject))
      .slice(0, 2) // Limit to 2 additional subjects for skills
      .forEach((subject) => {
        const subjectLower = subject.toLowerCase();

        // Programming/CS subjects
        if (
          subjectLower.includes("programming") ||
          subjectLower.includes("data structure") ||
          subjectLower.includes("algorithm") ||
          subjectLower.includes("software") ||
          subjectLower.includes("coding")
        ) {
          addRecommendation({
            title: `${subject} - Coding Practice`,
            description: `Practice coding problems related to ${subject} concepts`,
            category: "skill-development",
            priority: "high",
            estimatedDuration: Math.min(freePeriodDuration, 45),
            resources: [
              { title: "LeetCode", url: "https://leetcode.com" },
              { title: "HackerRank", url: "https://hackerrank.com" },
            ],
            relatedSubject: subject,
          });
        }

        // Database subjects
        else if (subjectLower.includes("database") || subjectLower.includes("sql")) {
          addRecommendation({
            title: `${subject} - SQL Practice`,
            description: `Practice SQL queries and database design concepts`,
            category: "skill-development",
            priority: "high",
            estimatedDuration: Math.min(freePeriodDuration, 40),
            resources: [
              { title: "SQLZoo", url: "https://sqlzoo.net" },
              { title: "PostgreSQL Tutorial", url: "https://www.postgresqltutorial.com" },
            ],
            relatedSubject: subject,
          });
        }

        // Math subjects
        else if (
          subjectLower.includes("math") ||
          subjectLower.includes("calculus") ||
          subjectLower.includes("algebra") ||
          subjectLower.includes("statistics")
        ) {
          addRecommendation({
            title: `${subject} - Problem Solving`,
            description: `Solve mathematical problems and practice formulas`,
            category: "skill-development",
            priority: "high",
            estimatedDuration: Math.min(freePeriodDuration, 35),
            resources: [{ title: "Khan Academy", url: "https://khanacademy.org" }],
            relatedSubject: subject,
          });
        }

        // Design subjects
        else if (subjectLower.includes("design") || subjectLower.includes("ui") || subjectLower.includes("ux")) {
          addRecommendation({
            title: `${subject} - Design Practice`,
            description: `Work on design projects or explore design principles`,
            category: "skill-development",
          priority: "medium",
          estimatedDuration: Math.min(freePeriodDuration, 45),
            priority: "medium",
            estimatedDuration: Math.min(freePeriodDuration, 45),
            resources: [
              { title: "Figma Community", url: "https://figma.com/community" },
              { title: "Dribbble", url: "https://dribbble.com" },
            ],
            relatedSubject: subject,
          });
        }

        // Web development subjects
        else if (
          subjectLower.includes("web") ||
          subjectLower.includes("html") ||
          subjectLower.includes("css") ||
          subjectLower.includes("javascript")
        ) {
          addRecommendation({
            title: `${subject} - Build Mini Project`,
            description: `Create a small web project to practice ${subject} concepts`,
            category: "skill-development",
            priority: "high",
            estimatedDuration: Math.min(freePeriodDuration, 60),
            resources: [
              { title: "MDN Web Docs", url: "https://developer.mozilla.org" },
              { title: "FreeCodeCamp", url: "https://freecodecamp.org" },
            ],
            relatedSubject: subject,
          });
        }
      });
  }

  // ==========================================
  // 2. STRENGTHS-BASED RECOMMENDATIONS
  // ==========================================
  if (strengths && strengths.length > 0) {
    strengths.slice(0, 1).forEach((strength) => { // Limit to 1 strength
      addRecommendation({
        title: `Practice ${strength}`,
        description: `Use this free time to strengthen your ${strength} skills with practice problems`,
        category: "personal-development",
        priority: "medium",
        estimatedDuration: Math.min(freePeriodDuration, 45),
        resources: [
          {
            title: "Practice Problems",
            url: "#",
          },
        ],
      });
    });
  }

  // ==========================================
  // 3. CAREER-SPECIFIC RECOMMENDATIONS
  // ==========================================
  if (careerGoals && careerGoals.length > 0) {
    const careerLower = careerGoals.join(' ').toLowerCase();

    if (careerLower.includes("developer") || careerLower.includes("programmer") || careerLower.includes("software engineer")) {
      recommendations.push({
        title: "Coding Practice for Career",
        description: "Solve coding problems on competitive programming platforms to prepare for technical interviews",
        category: "career",
        priority: "high",
        estimatedDuration: Math.min(freePeriodDuration, 60),
        resources: [
          { title: "LeetCode", url: "https://leetcode.com" },
          { title: "HackerRank", url: "https://hackerrank.com" },
          { title: "CodeForces", url: "https://codeforces.com" },
        ],
      });

      recommendations.push({
        title: "Build Portfolio Project",
        description: "Work on a personal project to showcase your development skills",
        category: "career",
        priority: "high",
        estimatedDuration: Math.min(freePeriodDuration, 60),
        resources: [{ title: "GitHub", url: "https://github.com" }],
      });
    }

    if (careerLower.includes("data") || careerLower.includes("analytics") || careerLower.includes("scientist")) {
      recommendations.push({
        title: "Data Analysis Practice",
        description: "Work on data analysis projects or learn new visualization techniques",
        category: "career",
        priority: "high",
        estimatedDuration: Math.min(freePeriodDuration, 50),
        resources: [
          { title: "Kaggle Datasets", url: "https://kaggle.com/datasets" },
          { title: "DataCamp", url: "https://datacamp.com" },
        ],
      });

      recommendations.push({
        title: "Learn Data Visualization",
        description: "Practice creating meaningful visualizations and dashboards",
        category: "skill-development",
        priority: "medium",
        estimatedDuration: Math.min(freePeriodDuration, 45),
        resources: [{ title: "Tableau Public", url: "https://public.tableau.com" }],
      });
    }

    if (careerLower.includes("design") || careerLower.includes("ui") || careerLower.includes("ux")) {
      addRecommendation({
        title: "UI/UX Design Practice",
        description: "Work on design challenges and improve your portfolio",
        category: "career",
        priority: "high",
        estimatedDuration: Math.min(freePeriodDuration, 50),
        resources: [
          { title: "Daily UI", url: "https://dailyui.co" },
          { title: "Behance", url: "https://behance.net" },
        ],
      });
    } else if (careerLower.includes("machine learning") || careerLower.includes("ai") || careerLower.includes("deep learning")) {
      addRecommendation({
        title: "ML/AI Learning",
        description: "Study machine learning algorithms and work on ML projects",
        category: "career",
        priority: "high",
        estimatedDuration: Math.min(freePeriodDuration, 60),
        resources: [
          { title: "Kaggle Learn", url: "https://kaggle.com/learn" },
          { title: "Fast.ai", url: "https://fast.ai" },
        ],
      });
    }
  }

  // ==========================================
  // 4. INTEREST-BASED RECOMMENDATIONS (Limited)
  // ==========================================
  if (interests && interests.length > 0) {
    const interestsLower = interests.join(' ').toLowerCase();

    if (interestsLower.includes("reading")) {
      addRecommendation({
        title: "Reading Time",
        description: "Read technical articles or books related to your subjects",
        category: "personal-development",
        priority: "medium",
        estimatedDuration: Math.min(freePeriodDuration, 30),
        resources: [
          { title: "Medium", url: "https://medium.com" },
          { title: "Dev.to", url: "https://dev.to" },
        ],
      });
    }

    if (interestsLower.includes("design") || interestsLower.includes("creative")) {
      recommendations.push({
        title: "Creative Design Practice",
        description: "Work on design projects or learn new design tools",
        category: "skill-development",
        priority: "medium",
        estimatedDuration: Math.min(freePeriodDuration, 45),
        resources: [
          { title: "Figma Community", url: "https://figma.com/community" },
          { title: "Awwwards", url: "https://awwwards.com" },
        ],
      });
    }

    if (interestsLower.includes("video") || interestsLower.includes("editing")) {
      recommendations.push({
        title: "Video Editing Practice",
        description: "Learn video editing techniques and tools",
        category: "skill-development",
        priority: "medium",
        estimatedDuration: Math.min(freePeriodDuration, 40),
        resources: [],
      });
    }

    if (interestsLower.includes("music") || interestsLower.includes("audio")) {
      recommendations.push({
        title: "Music Break",
        description: "Take a short music break to refresh your mind",
        category: "health",
        priority: "low",
        estimatedDuration: Math.min(freePeriodDuration, 15),
        resources: [],
      });
    }

    if (interestsLower.includes("writing") || interestsLower.includes("blog")) {
      recommendations.push({
        title: "Technical Writing",
        description: "Write a blog post about what you learned in class today",
        category: "personal-development",
        priority: "medium",
        estimatedDuration: Math.min(freePeriodDuration, 35),
        resources: [{ title: "Hashnode", url: "https://hashnode.com" }],
      });
    }
  }

  // ==========================================
  // 5. GENERAL ACADEMIC RECOMMENDATIONS (Limited)
  // ==========================================
  if (recommendations.length < 8) { // Only add if we don't have too many already
    addRecommendation({
      title: "Complete Pending Assignments",
      description: "Work on any pending assignments or homework from any subject",
      category: "academic",
      priority: "high",
      estimatedDuration: Math.min(freePeriodDuration, 60),
      resources: [],
    });

    addRecommendation({
      title: "Watch Educational Videos",
      description: "Watch educational content related to your subjects",
      category: "academic",
      priority: "medium",
      estimatedDuration: Math.min(freePeriodDuration, 20),
      resources: [
        { title: "Khan Academy", url: "https://khanacademy.org" },
        { title: "Coursera", url: "https://coursera.org" },
      ],
    });
  }

  // ==========================================
  // 6. HEALTH & WELLNESS RECOMMENDATIONS (Limited)
  // ==========================================
  if (freePeriodDuration >= 15) { // Only if there's enough time
    addRecommendation({
      title: "Take a Short Break",
      description: "Relax and recharge with a short walk or meditation",
      category: "health",
      priority: "low",
      estimatedDuration: 15,
      resources: [{ title: "Headspace", url: "https://headspace.com" }],
    });
  }

  // Sort by priority (high, medium, low) and limit to 10 recommendations
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  return recommendations
    .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
    .slice(0, 10); // Limit to 10 recommendations maximum
};

/**
 * Calculate free period duration from timetable
 * @param {Array} classes - Array of class objects with startTime and endTime
 * @param {String} currentTime - Current time in HH:MM format (optional)
 * @returns {Number} Duration in minutes
 */
export const calculateFreePeriodDuration = (classes, currentTime = null) => {
  if (!classes || classes.length === 0) {
    return 60; // Default 60 minutes
  }

  // Sort classes by start time
  const sortedClasses = [...classes].sort((a, b) => {
    const timeA = timeToMinutes(a.startTime);
    const timeB = timeToMinutes(b.startTime);
    return timeA - timeB;
  });

  let maxGap = 0;

  // Calculate gaps between consecutive classes
  for (let i = 0; i < sortedClasses.length - 1; i++) {
    const currentEnd = sortedClasses[i].endTime;
    const nextStart = sortedClasses[i + 1].startTime;

    const endMinutes = timeToMinutes(currentEnd);
    const startMinutes = timeToMinutes(nextStart);

    const gap = startMinutes - endMinutes;

    if (currentTime) {
      const currentMinutes = timeToMinutes(currentTime);
      // Check if current time falls in this gap
      if (currentMinutes >= endMinutes && currentMinutes < startMinutes) {
        return gap;
      }
    }

    if (gap > maxGap) {
      maxGap = gap;
    }
  }

  return maxGap > 0 ? maxGap : 60;
};

/**
 * Get user recommendations with filters
 * @param {String} userId - User ID
 * @param {Object} filters - Filter options (status, category, relatedSubject)
 * @returns {Promise<Array>} Array of recommendations
 */
export const getUserRecommendations = async (userId, filters = {}) => {
  const query = { user: userId };

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.relatedSubject) {
    query.relatedSubject = filters.relatedSubject;
  }

  const recommendations = await Recommendation.find(query)
    .sort({ priority: -1, createdAt: -1 })
    .populate("user", "name email");

  return recommendations;
};

/**
 * Update recommendation status
 * @param {String} recommendationId - Recommendation ID
 * @param {String} status - New status
 * @param {Object} feedback - Feedback object (optional)
 * @returns {Promise<Object>} Updated recommendation
 */
export const updateRecommendationStatus = async (recommendationId, status, feedback = null) => {
  const updateData = { status };

  if (status === "completed") {
    updateData.completedAt = getCurrentISTTime();
  }

  if (feedback) {
    updateData.feedback = feedback;
  }

  const recommendation = await Recommendation.findByIdAndUpdate(recommendationId, updateData, {
    new: true,
    runValidators: true,
  }).populate("user", "name email");

  return recommendation;
};

/**
 * Get recommendation statistics for a user
 * @param {String} userId - User ID
 * @returns {Promise<Object>} Statistics object
 */
export const getRecommendationStatistics = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  
  const total = await Recommendation.countDocuments({ user: userObjectId });
  const completed = await Recommendation.countDocuments({ user: userObjectId, status: "completed" });
  const pending = await Recommendation.countDocuments({ user: userObjectId, status: "pending" });
  const inProgress = await Recommendation.countDocuments({ user: userObjectId, status: "in-progress" });
  const skipped = await Recommendation.countDocuments({ user: userObjectId, status: "skipped" });

  const byCategory = await Recommendation.aggregate([
    { $match: { user: userObjectId } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);

  const bySubject = await Recommendation.aggregate([
    { $match: { user: userObjectId, relatedSubject: { $exists: true, $ne: null } } },
    { $group: { _id: "$relatedSubject", count: { $sum: 1 } } },
  ]);

  const averageRating = await Recommendation.aggregate([
    { $match: { user: userObjectId, "feedback.rating": { $exists: true } } },
    { $group: { _id: null, avgRating: { $avg: "$feedback.rating" } } },
  ]);

  return {
    total,
    completed,
    pending,
    inProgress,
    skipped,
    completionRate: total > 0 ? ((completed / total) * 100).toFixed(2) : 0,
    byCategory: byCategory.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    bySubject: bySubject.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    averageRating: averageRating.length > 0 ? averageRating[0].avgRating.toFixed(2) : 0,
  };
};

/**
 * Create recommendation for a user
 * @param {Object} recommendationData - Recommendation data
 * @returns {Promise<Object>} Created recommendation
 */
export const createRecommendation = async (recommendationData) => {
  const recommendation = await Recommendation.create(recommendationData);
  return await Recommendation.findById(recommendation._id).populate("user", "name email interests careerGoals");
};

/**
 * Delete recommendation
 * @param {String} recommendationId - Recommendation ID
 * @returns {Promise<Object>} Deleted recommendation
 */
export const deleteRecommendation = async (recommendationId) => {
  const recommendation = await Recommendation.findByIdAndDelete(recommendationId);
  return recommendation;
};

/**
 * Get recommendation by ID
 * @param {String} recommendationId - Recommendation ID
 * @returns {Promise<Object>} Recommendation object
 */
export const getRecommendationById = async (recommendationId) => {
  const recommendation = await Recommendation.findById(recommendationId).populate("user", "name email interests careerGoals strengths");
  return recommendation;
};

/**
 * Generate course recommendations based on user interests and career goals
 * @param {String} userId - User ID
 * @returns {Promise<Object>} Course recommendations organized by category
 */
export const generateCourseRecommendations = async (userId) => {
  try {
    const user = await User.findById(userId).select("name email interests careerGoals strengths");
    
    if (!user) {
      throw new Error("User not found");
    }

  const recommendedCourses = {
    careerBased: [],
    interestBased: [],
    popularCourses: [],
  };

  const addedCourses = new Set(); // To avoid duplicates

  // Helper function to add unique courses
  const addCourse = (course, category) => {
    const courseKey = `${course.title}-${course.platform}`;
    if (!addedCourses.has(courseKey)) {
      addedCourses.add(courseKey);
      recommendedCourses[category].push(course);
    }
  };

  // 1. Career-based recommendations
  if (user.careerGoals && user.careerGoals.length > 0) {
    user.careerGoals.forEach((goal) => {
      const courseCategories = careerToCourseMap[goal];
      if (courseCategories) {
        courseCategories.forEach((category) => {
          const courses = courseCatalog[category];
          if (courses) {
            // Add top 2 courses from each category
            courses.slice(0, 2).forEach((course) => {
              addCourse({ ...course, reason: `Recommended for ${goal}` }, "careerBased");
            });
          }
        });
      }
    });
  }

  // 2. Interest-based recommendations
  if (user.interests && user.interests.length > 0) {
    user.interests.forEach((interest) => {
      const courseCategories = interestToCourseMap[interest];
      if (courseCategories) {
        courseCategories.forEach((category) => {
          const courses = courseCatalog[category];
          if (courses) {
            // Add top 2 courses from each category
            courses.slice(0, 2).forEach((course) => {
              addCourse({ ...course, reason: `Matches your interest in ${interest}` }, "interestBased");
            });
          }
        });
      }
    });
  }

  // 3. Popular courses (if user has no specific interests/goals or to complement existing recommendations)
  const popularCategories = ["programming", "webDevelopment", "dataScience"];
  popularCategories.forEach((category) => {
    const courses = courseCatalog[category];
    if (courses) {
      // Add top rated course from each popular category
      courses.slice(0, 1).forEach((course) => {
        addCourse({ ...course, reason: "Highly rated and popular" }, "popularCourses");
      });
    }
  });

    return {
      user: {
        name: user.name,
        interests: user.interests,
        careerGoals: user.careerGoals,
      },
      recommendations: recommendedCourses,
      totalRecommendations: 
        recommendedCourses.careerBased.length + 
        recommendedCourses.interestBased.length + 
        recommendedCourses.popularCourses.length,
    };
  } catch (error) {
    throw new Error(`Failed to generate course recommendations: ${error.message}`);
  }
};export default {
  generatePersonalizedRecommendations,
  calculateFreePeriodDuration,
  getUserRecommendations,
  updateRecommendationStatus,
  getRecommendationStatistics,
  createRecommendation,
  deleteRecommendation,
  getRecommendationById,
  generateCourseRecommendations,
};
