import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userAgent: { type: String },
  lastSeen: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

const Device = mongoose.model("Device", deviceSchema);
export default Device;
