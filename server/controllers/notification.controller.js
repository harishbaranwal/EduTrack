import * as notificationService from "../services/notification.service.js";

// Create notification for all users

export const createNotificationForAll = async (req, res) => {
  try {
    const notificationData = req.body;
    const createdBy = req.user._id;

    const result = await notificationService.createNotificationForAll(
      notificationData,
      createdBy
    );

    res.status(201).json({
      success: true,
      message: "Notification created for all users",
      data: result,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create notification",
    });
  }
};

// Create notification for specific users

export const createNotificationForSpecific = async (req, res) => {
  try {
    const { recipients, ...notificationData } = req.body;
    const createdBy = req.user._id;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Recipients array is required",
      });
    }

    const result = await notificationService.createNotificationForUsers(
      notificationData,
      recipients,
      createdBy
    );

    res.status(201).json({
      success: true,
      message: "Notification created for specific users",
      data: result,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create notification",
    });
  }
};

// Create notification for a batch

export const createNotificationForBatch = async (req, res) => {
  try {
    const { batchId, ...notificationData } = req.body;
    const createdBy = req.user._id;

    if (!batchId) {
      return res.status(400).json({
        success: false,
        message: "Batch ID is required",
      });
    }

    const result = await notificationService.createNotificationForBatch(
      notificationData,
      batchId,
      createdBy
    );

    res.status(201).json({
      success: true,
      message: "Notification created for batch",
      data: result,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create notification",
    });
  }
};

// Get user's notifications

export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const filters = {
      type: req.query.type,
      priority: req.query.priority,
      isRead: req.query.isRead,
    };

    const notifications = await notificationService.getUserNotifications(userId, filters);

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch notifications",
    });
  }
};

// Get all notifications (Admin only)

export const getAllNotifications = async (req, res) => {
  try {
    const filters = {
      type: req.query.type,
      priority: req.query.priority,
    };

    const notifications = await notificationService.getAllNotifications(filters);

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch notifications",
    });
  }
};

// Get notification by ID

export const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await notificationService.getNotificationById(id);

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch notification",
    });
  }
};

// Mark notification as read

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await notificationService.markNotificationAsRead(id, userId);

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to mark notification as read",
    });
  }
};

// Mark all notifications as read

export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await notificationService.markAllNotificationsAsRead(userId);

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to mark all notifications as read",
    });
  }
};

// Delete notification

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    await notificationService.deleteNotification(id);

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to delete notification",
    });
  }
};

// Get notification statistics

export const getNotificationStats = async (req, res) => {
  try {
    const userId = req.query.userId;

    const statistics = await notificationService.getNotificationStatistics(userId);

    res.status(200).json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch notification statistics",
    });
  }
};
