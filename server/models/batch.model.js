import mongoose from "mongoose";
import { type } from "os";

const batchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Batch name is required"],
      trim: true,
    },
    department: {
      type: String,
    },
    year: {
      type: Number,
    },
    subjects: [
      {
        type: String,
      },
    ],
    capacity: {
      type: Number,
      min: [1, "Capacity must be at least 1"],
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    startDate:{
      type: Date,
    },
    endDate:{
      type: Date,
    },
    semester:{
      type: Number,
      enum: [1, 2, 3, 4, 5, 6, 7, 8],
    },
    classTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["Active", "Completed"],
      default: "Active",
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
batchSchema.index({ name: 1 });
batchSchema.index({ classTeacher: 1 });

batchSchema.virtual("totalStudents").get(function () {
  return this.students ? this.students.length : 0;
});

export default mongoose.model("Batch", batchSchema);
