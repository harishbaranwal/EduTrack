import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["info", "task", "announcement", "attendance"],
      default: "info",
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipientType: {
      type: String,
      enum: ["all", "specific"],
      required: true,
    },
    recipients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isRead: {
      type: Boolean,
      default: false,
    },
    attachmentUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipientType: 1 });
notificationSchema.index({ recipients: 1 });

// get notifications for a user
notificationSchema.statics.getUserNotifications = function (
  userId,
  options = {}
) {
  const { limit = 20, skip = 0, unreadOnly = false } = options;

  const query = {
    $or: [{ recipientType: "all" }, { recipients: userId }],
  };

  if (unreadOnly) {
    query.isRead = false;
  }

  return this.find(query)
    .populate("sender", "name email role")
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// notification for all users
notificationSchema.statics.createForAllUsers = function (data, senderId) {
  return this.create({
    ...data,
    recipientType: "all",
    sender: senderId,
  });
};

// notification for specific users
notificationSchema.statics.createForSpecificUsers = function (
  data,
  userIds,
  senderId
) {
  return this.create({
    ...data,
    recipientType: "specific",
    recipients: userIds,
    sender: senderId,
  });
};

// Mark notification as read for a user
notificationSchema.statics.markAsRead = function (notificationId, userId) {
  return this.findByIdAndUpdate(
    notificationId,
    { isRead: true },
    { new: true }
  );
};

export default mongoose.model("Notification", notificationSchema);
