import mongoose from "mongoose";

const recommendationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "academic",
        "skill-development",
        "career",
        "personal-development",
        "health",
      ],
      default: "academic",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    estimatedDuration: {
      type: Number, // in minutes
      required: true,
    },
    resources: [
      {
        title: String,
        url: String,
      },
    ],
    relatedSubject: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "skipped"],
      default: "pending",
    },
    completedAt: {
      type: Date,
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: String,
    },
  },
  {
    timestamps: true,
  }
);

recommendationSchema.index({ user: 1, status: 1 });
recommendationSchema.index({ category: 1 });

export default mongoose.model("Recommendation", recommendationSchema);