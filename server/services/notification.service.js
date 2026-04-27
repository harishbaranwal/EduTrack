import mongoose from "mongoose";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import Batch from "../models/batch.model.js";
import { getCurrentISTTime } from "../utils/timezone.js";

// Create notification for all users

export const createNotificationForAll = async (notificationData, senderId) => {
  const users = await User.find({}, "_id");
  const recipientIds = users.map((user) => user._id);

  return await Notification.createForAllUsers(notificationData, senderId);
};

//  Create notification for specific users

export const createNotificationForUsers = async (notificationData, recipientIds, senderId) => {
  // Validate recipients exist
  const users = await User.find({ _id: { $in: recipientIds } });

  if (users.length !== recipientIds.length) {
    throw new Error("Some recipient users do not exist");
  }

  return await Notification.createForSpecificUsers(notificationData, recipientIds, senderId);
};

// Create notification for a batch

export const createNotificationForBatch = async (notificationData, batchId, senderId) => {
  // Get all students in the batch
  const batch = await Batch.findById(batchId).populate("students", "_id");

  if (!batch) {
    throw new Error("Batch not found");
  }

  const recipientIds = batch.students.map((student) => student._id);

  if (recipientIds.length === 0) {
    throw new Error("No students found in this batch");
  }

  return await Notification.createForSpecificUsers(notificationData, recipientIds, senderId);
};


// Get notifications for a user

export const getUserNotifications = async (userId, filters = {}) => {
  const options = {
    limit: filters.limit || 50,
    skip: filters.skip || 0,
    sort: filters.sort || { createdAt: -1 },
  };

  if (filters.type) {
    options.type = filters.type;
  }

  if (filters.priority) {
    options.priority = filters.priority;
  }

  if (filters.isRead !== undefined) {
    options.isRead = filters.isRead;
  }

  return await Notification.getUserNotifications(userId, options);
};

//  Get all notifications (Admin only)

export const getAllNotifications = async (filters = {}) => {
  const query = {};

  if (filters.type) {
    query.type = filters.type;
  }

  if (filters.priority) {
    query.priority = filters.priority;
  }

  if (filters.senderId) {
    query.sender = filters.senderId;
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(filters.limit || 100)
    .populate("sender", "name email role")
    .populate("recipients", "name email role");

  return notifications;
};

// Get notification by ID

export const getNotificationById = async (notificationId) => {
  const notification = await Notification.findById(notificationId)
    .populate("sender", "name email role")
    .populate("recipients", "name email role");

  if (!notification) {
    throw new Error("Notification not found");
  }

  return notification;
};

// Mark notification as read for a user

export const markNotificationAsRead = async (notificationId, userId) => {
  return await Notification.markAsRead(notificationId, userId);
};

// Mark all notifications as read for a user

export const markAllNotificationsAsRead = async (userId) => {
  const result = await Notification.updateMany(
    {
      recipients: userId,
      "readBy.user": { $ne: userId },
    },
    {
      $push: {
        readBy: {
          user: userId,
          readAt: getCurrentISTTime(),
        },
      },
    }
  );

  return result;
};

// Delete notification

export const deleteNotification = async (notificationId) => {
  const notification = await Notification.findByIdAndDelete(notificationId);

  if (!notification) {
    throw new Error("Notification not found");
  }

  return notification;
};

// Get notification statistics for a user

export const getNotificationStatistics = async (userId) => {
  const total = await Notification.countDocuments({ recipients: userId });

  const unread = await Notification.countDocuments({
    recipients: userId,
    "readBy.user": { $ne: userId },
  });

  const read = total - unread;

  const byType = await Notification.aggregate([
    { $match: { recipients: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: "$type", count: { $sum: 1 } } },
  ]);

  const byPriority = await Notification.aggregate([
    { $match: { recipients: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: "$priority", count: { $sum: 1 } } },
  ]);

  return {
    total,
    read,
    unread,
    byType: byType.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    byPriority: byPriority.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
  };
};

// Delete old notifications

export const deleteOldNotifications = async (daysOld = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await Notification.deleteMany({
    createdAt: { $lt: cutoffDate },
  });

  return result;
};

//  Get recent notifications for dashboard

export const getRecentNotifications = async (userId, limit = 10) => {
  return await Notification.getUserNotifications(userId, {
    limit,
    sort: { createdAt: -1 },
  });
};

export default {
  createNotificationForAll,
  createNotificationForUsers,
  createNotificationForBatch,
  getUserNotifications,
  getAllNotifications,
  getNotificationById,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationStatistics,
  deleteOldNotifications,
  getRecentNotifications,
};
