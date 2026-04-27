import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema(
  {
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },
    classTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Made optional since classes have individual teachers
    },
    day: {
      type: String,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      required: true,
    },
    classes: [
      {
        subject: {
          type: String,
          required: true,
        },
        teacher: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        startTime: {
          type: String,
          required: true,
        },
        endTime: {
          type: String,
          required: true,
        },
        room: {
          type: String,
          default: null,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
timetableSchema.index({ batch: 1, day: 1 });
timetableSchema.index({ "classes.teacher": 1, day: 1 });

export default mongoose.model("Timetable", timetableSchema);
