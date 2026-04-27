import mongoose from "mongoose";

const counterSchema = new mongoose.Schema(
  {
    year: {
      type: Number,
      required: true,
    },
    role: {
      type: String,
      enum: ["Student", "Teacher", "Admin"],
      required: true,
    },
    lastSequence: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: one counter per role per year
counterSchema.index({ year: 1, role: 1 }, { unique: true });

const Counter = mongoose.model("Counter", counterSchema);

export default Counter;
