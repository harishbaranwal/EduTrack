import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },
    // Reference to the specific class in timetable
    timetable: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Timetable",
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    classStartTime: {
      type: String,
      required: true,
    },
    classEndTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Present", "Absent"],
      default: "Absent",
    },
    method: {
      type: String,
      enum: ["QR_Scan", "Location", "Manual"],
      default: "QR_Scan",
    },
    // GeoJSON location (longitude, latitude)
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
    },
    ipAddress: {
      type: String,
    },
    distanceFromCampus: {
      type: Number,
      default: null,
    },

    markedAt: {
      type: Date,
      default: Date.now,
    },
    // Admin modification tracking
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    modifiedAt: {
      type: Date,
    },
    // Remarks for manual attendance
    remarks: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);


// Prevent duplicate attendance for same user, subject, and date
attendanceSchema.index({ user: 1, subject: 1, date: 1 }, { unique: true });

// Helper to set location from lat/lng
attendanceSchema.methods.setLocation = function (latitude, longitude) {
  if (latitude == null || longitude == null) return;
  this.location = {
    type: "Point",
    coordinates: [Number(longitude), Number(latitude)],
  };
};

export default mongoose.model("Attendance", attendanceSchema);